import Note from '../models/Note.js';

const getNotes = async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const addNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    const note = new Note({
      user: req.user._id,
      title,
      content,
    });

    const createdNote = await note.save();
    res.status(201).json(createdNote);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const updateNote = async (req, res) => {
  const { title, content } = req.body;

  try {
    const note = await Note.findById(req.params.id);

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    note.title = title || note.title;
    note.content = content || note.content;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(404).json({ message: 'Note not found' });
  }
};

const deleteNote = async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await Note.deleteOne({ _id: req.params.id });
    res.json({ message: 'Note removed successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({ message: error.message || 'Failed to delete note' });
  }
};

export { getNotes, addNote, updateNote, deleteNote };
