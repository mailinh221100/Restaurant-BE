const {Chat, Group} = require('../models/chat.model');
const socketUtil = require('../utils/socket.util');

async function getAllChats(req, res, next) {
  try {
    const {groupId} = req.params;
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(200).json([]);
    }

    const chats = await Chat.find({group: group._id})
      .populate({
        path: 'sender',
        select: 'fullName'
      })
      .sort('createdAt');
    return res.status(200).json(chats);
  } catch (error) {
    next(error);
  }
}

async function getGroupChats(req, res, next) {
  try {
    const groups = await Group.find()
      .populate({
        path: 'owner',
        select: 'fullName'
      });
    return res.status(200).json(groups);
  } catch (error) {
    next(error);
  }
}

async function getGroupOfCurrentUser(req, res, next) {
  try {
    const {_id: userId} = req.user;
    let group = await Group.findOne({owner: userId});
    if (!group) {
      group = await Group.create({owner: userId});
    }
    return res.status(200).json(group);
  } catch (error) {
    next(error);
  }
}
async function createChat(req, res, next) {
  try {
    const {_id: userId} = req.user;
    const {message, group} = req.body;
    const chat = await Chat.create({message, group, sender: userId});

    const addedChat = await Chat.findById(chat._id)
      .populate({
        path: 'sender',
        select: 'fullName'
      });
    // send socket
    socketUtil.get().emit(`group-${group}`, addedChat);

    return res.status(200).json(addedChat);
  } catch (error) {
    next(error);
  }
}


module.exports = {
  getAllChats,
  getGroupChats,
  getGroupOfCurrentUser,
  createChat,
}