import { Router } from "express";
// import multer from "multer";
import {
  getallArticle,
  createArticle,
  updateArticle,
  deleteArticle,
  getallJob,
  createJob,
  updateJob,
  deleteJob,
  getallIssue,
  createIssue,
  updateIssue,
  deleteIssue,
  getallLearn,
  createLearn,
  updateLearn,
  deleteLearn,
  likeArticle,
  commentArticle,
  shareArticle,
  likeIssue,
  commentIssue,
  shareIssue,
  likeLearn,
  commentLearn,
  shareLearn,
  likeJob,
  commentJob,
  shareJob,
  Videos,
  saveResult,
  searchLearnData,
  searchLibaryData


} from "../PostControllers/postController.js";

import passport from '../middleware/linkedInAuth.js';

import { auth } from "../middleware/auth.js";
import path from "path";

const router = Router();

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join("./uploads/"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const mlMiddlewareMultiples = multer({
//   storage,
//   limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
//   fileFilter: (req, file, cb) => {
//     if (
//       file.mimetype == "image/png" ||
//       file.mimetype == "image/jpg" ||
//       file.mimetype == "image/jpeg"
//     ) {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       const err = new Error("Only .png, .jpg and .jpeg format allowed!");
//       err.name = "ExtensionError";
//       return cb(err);
//     }
//   },
// });

// const mlMiddlewareVideoUpload = multer({
//   storage,
//   limits: { fileSize: 1000 * 1024 * 1024 }, // 1GB
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype == "video/mp4") {
//       cb(null, true);
//     } else {
//       cb(null, false);
//       const err = new Error("Only mp4 format allowed!");
//       err.name = "ExtensionError";
//       return cb(err);
//     }
//   },
// });

// const mlMiddleware = multer({
//   //storage: 100,//CourseFileStorage,
//   dest: "uploads/",
//   limits: { fieldSize: 25 * 1024 * 1024 },
// });

// Articles Routes //

router.get("/", auth, getallArticle);
router.post("/create-article", [auth,mlMiddlewareMultiples.single("file")], createArticle);
router.put("/:id", auth, updateArticle);
router.delete("/:id", auth, deleteArticle);

// Jobs Routes //

router.get("/jobs", auth, getallJob);
router.post(
  "/create-job",
  [auth, mlMiddlewareMultiples.single("file")],
  createJob
);
router.put("/update-job/:id", auth, updateJob);
router.delete("/delete-job/:id", auth, deleteJob);

// Issue Routes //
router.get("/issues", auth, getallIssue);
router.post(
  "/create-issue",
  [auth, mlMiddlewareMultiples.single("file")],
  createIssue
);
router.put("/update-issue/:id", auth, updateIssue);
router.delete("/delete-issue/:id", auth, deleteIssue);

// Learn Routes //
router.get("/learn", auth, getallLearn);
router.post(
  "/create-learn",
  [auth, mlMiddlewareVideoUpload.single("file")],
  createLearn
);
router.put("/update-learn/:id", auth, updateLearn);
router.delete("/delete-learn/:id", auth, deleteLearn);


  // likes Route //

// router.get("/like", auth,likeArticle);

//   // Comments Route //

//   router.post("/comment/:id",auth,commentArticle);


// Like an article
router.post('/articles/:articleId/:userId/like', likeArticle);

// Share an article
router.post('/articles/:articleId/:userId/share', shareArticle);

// Comment on an article
router.post('/articles/:articleId/:userId/comment', commentArticle);




// Like an Issue
router.post('/issue/:issueId/:userId/like', likeIssue);

// Share an Issue
router.post('/issue/:issueId/:userId/share', shareIssue);

// Comment on an Issue
router.post('/issue/:issueId/:userId/comment', commentIssue);



// Like an Learn
router.post('/learn/:learnId/:userId/like', likeLearn);

// Share an Learn
router.post('/learn/:learnId/:userId/share', shareLearn);

// Comment on an Learn
router.post('/learn/:learnId/:userId/comment', commentLearn);


// Like an Learn
router.post('/job/:jobId/:userId/like', likeJob);

// Share an Learn
router.post('/job/:jobId/:userId/share', shareJob);

// Comment on an Learn
router.post('/job/:jobId/:userId/comment', commentJob);


// get youtube videos //

router.get('/videos' , Videos);


// save libary data //

router.get('/save' , saveResult);

 
// Search for youtube videos //
router.post('/search-learn/:query' , searchLearnData);

// Search for youtube videos //
router.post('/search-libary/:query' , searchLibaryData);



// Stripe Payment Routes //
// router.post('/create-customer',auth,createCustomer);
// router.post('/add-card',addNewCard);
// router.post('/create-charge',createCharges);

// router.post('/:id', auth, payforProduct);

export default router;
