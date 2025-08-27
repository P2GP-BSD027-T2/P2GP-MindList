require("dotenv").config();
const cloudinary = require("cloudinary").v2;
const { Attachment } = require("../models");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
class AttachmentController {
  static async uploadAttachment(req, res, next) {
    try {
      if (!req.file) throw new Error("EMPTY_REQ_FILE");
      const { id: BoardId, taskId: TaskId } = req.params;
      const { mimetype, buffer } = req.file;

      const bufferToString = buffer.toString("base64");
      const dataToUpload = `data:${mimetype};base64,${bufferToString}`;

      const result = await cloudinary.uploader.upload(dataToUpload);

      let type = "document";
      if (result.resource_type === "image") type = "image";

      const attachment = await Attachment.create({
        BoardId,
        TaskId,
        url: result.secure_url,
        type,
      });

      res
        .status(201)
        .json({ message: "File uploaded successfully", attachment });
    } catch (err) {
      next(err);
    }
  }

  static async getAttachment(req, res, next) {
    try {
      const { id: BoardId, taskId: TaskId } = req.params;

      const attachments = await Attachment.findAll({
        where: { BoardId, TaskId },
      });

      res.status(200).json(attachments);
    } catch (err) {
      next(err);
    }
  }

  static async deleteAttachment(req, res, next) {
    try {
      const { id: BoardId, taskId: TaskId, attachmentId } = req.params;

      const attachment = await Attachment.findOne({
        where: { id: attachmentId, BoardId, TaskId },
      });
      if (!attachment) throw new Error("ATTACHMENT_NOT_FOUND");

      await Attachment.destroy({
        where: { id: attachmentId, TaskId, BoardId },
      });

      res.status(200).json({ message: "File deleted successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AttachmentController;
