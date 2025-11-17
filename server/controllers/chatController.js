import OpenAI from 'openai';
import ChatMessage from '../models/ChatMessage.js';
import Task from '../models/Task.js';
import Note from '../models/Note.js';

// Initialize OpenAI client
// Check if using OpenRouter (sk-or-v1-...) or direct OpenAI (sk-...)
const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  ...(isOpenRouter && {
    baseURL: 'https://openrouter.ai/api/v1',
    defaultHeaders: {
      'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
      'X-Title': 'Productivity Dashboard',
    }
  }),
});

console.log('🤖 OpenAI client initialized with:', isOpenRouter ? 'OpenRouter' : 'Direct OpenAI');

// Temporary storage for pending tool calls (in production, use Redis or database)
const pendingToolCalls = new Map();

// AI Cat Bot System Prompt
const CAT_BOT_SYSTEM_PROMPT = `You are a helpful and adorable AI cat assistant named "Whiskers" 🐱. 
You help users manage their productivity by creating tasks and notes.

Personality traits:
- You're friendly, encouraging, and slightly playful
- You occasionally add cat-related puns or expressions (but don't overdo it)
- You're genuinely interested in helping users be productive
- You confirm actions before executing them
- You use emojis occasionally to be more expressive

Your capabilities:
- Create tasks with title, description, and status
- Create notes with title and content
- Help users organize their work
- Provide productivity tips
- Have casual conversations while staying helpful

IMPORTANT RULES for creating notes and tasks:
1. When user asks to create a note, ALWAYS extract:
   - A clear, concise title (2-100 characters)
   - Detailed content based on the user's request (at least 10 characters)
2. If the user provides a topic without details, ask them what they want to include
3. Be proactive - if user says "create a note about X", generate useful starter content
4. Content should be helpful and relevant to the topic
5. Always confirm with the user before creating

Examples:
- User: "Create a note about software engineering"
  You: Use create_note with title: "Software Engineering" and content: "Key concepts and topics in software engineering to explore and study."
  
- User: "Make a note for meeting tomorrow"
  You: Use create_note with title: "Meeting Tomorrow" and content: "Important meeting scheduled for tomorrow. Topics to discuss and prepare."

Always be clear about what actions you're going to take and ask for confirmation when creating or modifying data.`;

// Function definitions for OpenAI function calling
const tools = [
  {
    type: 'function',
    function: {
      name: 'create_task',
      description: 'Create a new task for the user. Always ask for confirmation before calling this function.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the task',
          },
          description: {
            type: 'string',
            description: 'Detailed description of the task',
          },
          status: {
            type: 'string',
            enum: ['Not Started', 'In Progress', 'Completed'],
            description: 'The status of the task',
            default: 'Not Started',
          },
        },
        required: ['title', 'description'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'create_note',
      description: 'Create a new note for the user with a title and content. Use this when the user wants to save information, ideas, or reminders. Generate helpful content if the user only provides a topic.',
      parameters: {
        type: 'object',
        properties: {
          title: {
            type: 'string',
            description: 'The title of the note (e.g., "Software Engineering Notes", "Meeting Ideas")',
          },
          content: {
            type: 'string',
            description: 'The detailed content/body of the note. Should be at least 10 characters. If user only provides a topic, generate relevant starter content.',
          },
        },
        required: ['title', 'content'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_tasks',
      description: 'Get all tasks for the user to help answer questions about their tasks',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_notes',
      description: 'Get all notes for the user to help answer questions about their notes',
      parameters: {
        type: 'object',
        properties: {},
      },
    },
  },
];

// Execute function calls
const executeFunctionCall = async (functionName, args, userId) => {
  try {
    switch (functionName) {
      case 'create_task':
        console.log('✅ Creating task:', args);
        
        // Validate arguments
        if (!args.title || args.title.trim().length < 3) {
          return {
            success: false,
            message: 'Task title must be at least 3 characters long',
          };
        }
        
        if (!args.description || args.description.trim().length < 5) {
          return {
            success: false,
            message: 'Task description must be at least 5 characters long',
          };
        }
        
        const task = new Task({
          user: userId,
          title: args.title.trim(),
          description: args.description.trim(),
          status: args.status || 'Not Started',
        });
        
        const createdTask = await task.save();
        console.log('✅ Task created:', createdTask._id);
        
        return {
          success: true,
          data: createdTask,
          message: `Task "${args.title}" created successfully! 🎉`,
        };

      case 'create_note':
        console.log('📝 Creating note:', args);
        
        // Validate arguments
        if (!args.title || args.title.trim().length < 2) {
          return {
            success: false,
            message: 'Note title must be at least 2 characters long',
          };
        }
        
        if (!args.content || args.content.trim().length < 1) {
          return {
            success: false,
            message: 'Note content cannot be empty',
          };
        }
        
        const note = new Note({
          user: userId,
          title: args.title.trim(),
          content: args.content.trim(),
        });
        
        const createdNote = await note.save();
        console.log('✅ Note created:', createdNote._id);
        
        return {
          success: true,
          data: createdNote,
          message: `Note "${args.title}" created successfully! 📝`,
        };

      case 'get_tasks':
        const tasks = await Task.find({ user: userId }).sort({ createdAt: -1 });
        return {
          success: true,
          data: tasks,
          message: `Found ${tasks.length} task(s)`,
        };

      case 'get_notes':
        const notes = await Note.find({ user: userId }).sort({ createdAt: -1 });
        return {
          success: true,
          data: notes,
          message: `Found ${notes.length} note(s)`,
        };

      default:
        return {
          success: false,
          message: 'Unknown function',
        };
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    };
  }
};

// Chat with AI Cat Bot
export const chatWithCatBot = async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  try {
    // Save user message
    const userMessage = await ChatMessage.create({
      user: req.user._id,
      role: 'user',
      content: message,
    });

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: CAT_BOT_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages,
      tools: tools,
      tool_choice: 'auto',
      temperature: 0.7,
    });

    const assistantMessage = completion.choices[0].message;

    // Check if AI wants to call a function
    if (assistantMessage.tool_calls) {
      const toolCall = assistantMessage.tool_calls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      // Save assistant message with tool call
      await ChatMessage.create({
        user: req.user._id,
        role: 'assistant',
        content: assistantMessage.content || '',
        toolCalls: assistantMessage.tool_calls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        })),
      });

      // Return tool call for user confirmation
      res.json({
        success: true,
        message: assistantMessage.content || '',
        requiresConfirmation: true,
        toolCall: {
          id: toolCall.id,
          function: functionName,
          arguments: functionArgs,
        },
      });
    } else {
      // Save assistant message
      await ChatMessage.create({
        user: req.user._id,
        role: 'assistant',
        content: assistantMessage.content,
      });

      res.json({
        success: true,
        message: assistantMessage.content,
        requiresConfirmation: false,
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Meow... something went wrong! 😿 ' + error.message,
    });
  }
};

// Confirm and execute tool call
export const confirmToolCall = async (req, res) => {
  const { toolCallId, approved } = req.body;

  try {
    // Get the stored tool call
    const toolCallData = pendingToolCalls.get(toolCallId);
    
    if (!toolCallData) {
      return res.status(400).json({
        success: false,
        message: 'Tool call not found or expired',
      });
    }

    if (!approved) {
      // Remove from pending
      pendingToolCalls.delete(toolCallId);
      
      return res.json({
        success: true,
        message: 'Okay, I won\'t do that. Let me know if you need anything else! 😺',
      });
    }

    // Execute the function
    const result = await executeFunctionCall(
      toolCallData.functionName, 
      toolCallData.functionArgs, 
      req.user._id
    );

    // Save function result as a message
    await ChatMessage.create({
      user: req.user._id,
      role: 'assistant',
      content: result.message,
      metadata: {
        functionName: toolCallData.functionName,
        functionResult: JSON.stringify(result),
      },
    });

    // Remove from pending
    pendingToolCalls.delete(toolCallId);

    res.json({
      success: true,
      message: result.message,
      data: result.data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const messages = await ChatMessage.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit);

    res.json({
      success: true,
      data: messages.reverse(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Clear chat history
export const clearChatHistory = async (req, res) => {
  try {
    await ChatMessage.deleteMany({ user: req.user._id });
    res.json({
      success: true,
      message: 'Chat history cleared! Starting fresh! 🐾',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Stream chat with AI Cat Bot (SSE - Server-Sent Events)
export const streamChatWithCatBot = async (req, res) => {
  const { message, conversationHistory = [] } = req.body;

  console.log('📨 Chat stream request received:', { 
    message, 
    userId: req.user._id,
    hasApiKey: !!process.env.OPENAI_API_KEY 
  });

  try {
    // Set headers for SSE
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable buffering for nginx

    console.log('✅ SSE headers set');

    // Save user message
    const userMessage = await ChatMessage.create({
      user: req.user._id,
      role: 'user',
      content: message,
    });

    console.log('✅ User message saved to DB');

    // Send initial event
    res.write(`data: ${JSON.stringify({ type: 'start', message: 'Whiskers is thinking... 🐱' })}\n\n`);
    console.log('✅ Start event sent');

    // Build messages array for OpenAI
    const messages = [
      { role: 'system', content: CAT_BOT_SYSTEM_PROMPT },
      ...conversationHistory.slice(-10).map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    console.log('📤 Calling OpenAI API with', messages.length, 'messages');

    // Call OpenAI API with streaming
    const stream = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages: messages,
      tools: tools,
      tool_choice: 'auto',
      temperature: 0.7,
      stream: true,
    });

    console.log('✅ OpenAI stream created');

    let fullResponse = '';
    let toolCalls = [];
    let currentToolCall = null;

    // Process the stream
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;

      // Handle content streaming
      if (delta?.content) {
        fullResponse += delta.content;
        
        // Send token to client
        res.write(`data: ${JSON.stringify({ 
          type: 'token', 
          content: delta.content 
        })}\n\n`);
      }

      // Handle tool calls
      if (delta?.tool_calls) {
        for (const toolCall of delta.tool_calls) {
          if (!currentToolCall || toolCall.index !== currentToolCall.index) {
            if (currentToolCall) {
              toolCalls.push(currentToolCall);
            }
            currentToolCall = {
              index: toolCall.index,
              id: toolCall.id || '',
              type: toolCall.type || 'function',
              function: {
                name: toolCall.function?.name || '',
                arguments: toolCall.function?.arguments || '',
              },
            };
          } else {
            if (toolCall.function?.name) {
              currentToolCall.function.name += toolCall.function.name;
            }
            if (toolCall.function?.arguments) {
              currentToolCall.function.arguments += toolCall.function.arguments;
            }
          }
        }
      }
    }

    // Add the last tool call if exists
    if (currentToolCall) {
      toolCalls.push(currentToolCall);
    }

    // Check if there are tool calls
    if (toolCalls.length > 0) {
      const toolCall = toolCalls[0];
      const functionName = toolCall.function.name;
      const functionArgs = JSON.parse(toolCall.function.arguments);

      // Store tool call data for confirmation
      pendingToolCalls.set(toolCall.id, {
        functionName,
        functionArgs,
        userId: req.user._id,
        timestamp: Date.now(),
      });

      // Auto-expire after 5 minutes
      setTimeout(() => {
        pendingToolCalls.delete(toolCall.id);
      }, 5 * 60 * 1000);

      // Save assistant message with tool call
      await ChatMessage.create({
        user: req.user._id,
        role: 'assistant',
        content: fullResponse || '',
        toolCalls: toolCalls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments
          }
        })),
      });

      // Send tool call event
      res.write(`data: ${JSON.stringify({ 
        type: 'tool_call',
        toolCall: {
          id: toolCall.id,
          function: {
            name: functionName,
            arguments: functionArgs,
          },
        }
      })}\n\n`);

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        type: 'done',
        fullMessage: fullResponse,
        requiresConfirmation: true
      })}\n\n`);
    } else {
      // Save assistant message
      await ChatMessage.create({
        user: req.user._id,
        role: 'assistant',
        content: fullResponse,
      });

      // Send completion event
      res.write(`data: ${JSON.stringify({ 
        type: 'done',
        fullMessage: fullResponse,
        requiresConfirmation: false
      })}\n\n`);
    }

    // Close the stream
    console.log('✅ Stream completed. Response length:', fullResponse.length);
    res.end();

  } catch (error) {
    console.error('❌ Streaming error:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    res.write(`data: ${JSON.stringify({ 
      type: 'error',
      message: 'Meow... something went wrong! 😿 ' + error.message
    })}\n\n`);
    res.end();
  }
};
