class AttachmentController {
  static async upload(req, res, next) {
    try {
      res.status(200).json({ message: "File uploaded successfully" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AttachmentController;
