const WorkSpace = require('../models/Workspace');


const isRoomMember = (roomId, userId) =>{
    const ids = roomId.split('_');
    return ids.includes(userId.toString());
};


const getWorkspace = async(req, res) =>{
    try{
        const { roomId } = req.params;
        const userId = req.user._id;

        if(!isRoomMember){
            return res.status(403).json({
                message: 'Not Authorized'
            });
        }
        let workspace = await WorkSpace.findOne({ roomId })
        .populate('notes.addedBy', 'name avatar')
        .populate('goals.addedBy', 'name avatar')
        .populate('resources.addedby', 'name avatar')
        .populate('members', 'name avatar');

        if(!workspace){
            const ids = roomId.split('_');
            workspace = await WorkSpace.create({
                roomId,
                members: ids,
                notes: [],
                goals: [],
                resources: []
            });
        }
        res.status(200).json( workspace);

    }catch(error){
        res.status(500).json({ message: error.message});

    }
};
   
const addNote = async (req, res) =>{
    try{
        const { roomId } =  req.params;
        const { title, content } = req.body;
        const userId = req.user._id;
        if(!isRoomMember(roomId, userId)){
            return res.status(403).json({message: 'not Authorized'});

        }
        if(!content?.trim()){
            return res.status(400).json({message: 'Note content is required'});
        };

        const workspace = await WorkSpace.findOneAndUpdate(
            {roomId},
            {
                $push:{
                    notes:{
                        title, content, addedBy: userId
                    }
                }
            },
            { new: true, upsert: true }
        ).populate('notes.addedby', 'name avatar');


        const newNote  = workspace.notes[workspace.notes.length-1];
        res.status(200).json({message: 'Note added', note: newNote});


    }catch(error){
        res.status(500).json({message: error.message});

    }
};

const updateNote = async(req, res) =>{
    try{
        const { roomId, noteId } = req.params;
        const { title, content } = req.body;
        const userId = req.user._id;

        if(!isRoomMember(roomId, userId)){
        return res.status(403).json({ message: 'Not Authorized'});           
        };

        const note = workspace.notes.id(noteId);
        if(!note){
            return res.status(404).json({message: 'Note not found'});
        }


        if(note.addedBy.toString() !== userId.toString()){
            return res.status(403).json({
                message: 'Only the  note author can edit this'
            });

        }
        if(title) note.title = title;
        if(content) note.content = content;

            await workspace.save();
            res.status(200).json({  message: 'Note updated', note});

    }catch(error){
        res.status(500).json({ message: error.message });
    }
};
 const deleteNote = async(req, res) =>{
    try{
        
    }
 }