import { Router } from "express";
import multer from "multer";
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
  replyComment,
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
  searchLibaryData,
  
  deleteComment,
  updateComment,
  likeComment,
  likeReply,
  editReply,
  deleteReply,
  nestedReply,
  fetchSharedArticles,
  deleteSharedArticle,
  getNotifications,
  deleteCommentJob,
  updateCommentJob,
  likeCommentJob,
  fetchSharedJobs,
  deleteSharedJob,
  updateCommentIssue,
  deleteCommentIssue,
  likeCommentIssue,
  deleteSharedIssue,
  saveYouTubeData,
  deleteCommentLearn,
  likeCommentLearn,
  updateCommentLearn,
  deleteSharedLearn,
  getLibary,
  handleRunPrompt,

  getAllApiJobs,
  
  searchJobsInDB,
  getJobSuggestions,
  getLocationSuggestions,
  getRapidjobs,
  fetchAndSaveJobs,
  uploadProfilePic,
  getAllapi



} from "../PostControllers/postController.js";

import passport from '../middleware/linkedInAuth.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../cloudinary/cloudinaryConfig.js';

import { auth } from "../middleware/auth.js";
import {authenticateApiKey } from "../middleware/apikeyAuth.js";
import path from "path";
import { get } from "http";

const router = Router();







const cloudinaryStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads', // Folder where images will be stored in Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'mp4','mov'],
    resource_type: 'auto', // Allowed file formats
  },
});




const upload = multer({ storage: cloudinaryStorage });










// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, path.join("../../client/WIP-Frontend/src/images"));
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.originalname);
//   },
// });

// const mlMiddlewareMultiples = multer({
//   storage,
//   limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
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


router.get("/get-article",auth,getallArticle);
router.post("/create-article",auth,upload.single("file"), createArticle);
router.put("/update-article/:id",auth,upload.single("file"),updateArticle);
router.delete("/delete-article/:id",auth, deleteArticle);
// router.get("/get-article",auth,getallArticle);
// router.post("/create-article",auth,createArticle);
// router.put("/update-article/:id",auth,updateArticle);
// router.delete("/delete-article/:id",auth, deleteArticle);

// Jobs Routes //

router.get("/jobs", auth, getallJob);
router.post("/create-job",auth,upload.single("file"),createJob);
router.put("/update-job/:id", auth, upload.single("file"),updateJob);
router.delete("/delete-job/:id", auth, deleteJob);


router.post('/jobs/:jobId/comment',auth, commentJob);
router.delete('/jobs/:jobId/:commentId/delete',auth,deleteCommentJob);
router.put('/jobs/:jobId/:commentId/update',auth,updateCommentJob);
router.put('/jobs/:jobId/comments/:commentId/like',auth,likeCommentJob);
router.put('/jobs/:jobId', auth, likeJob);
router.post('/jobs/:jobId/share', auth,shareJob);
router.get('/profiles/:userId/shared-jobs', auth, fetchSharedJobs);
router.delete('/profiles/:userId/shared-jobs/:jobId', auth, deleteSharedJob);




router.put(
  "/profile/upload-picture/:id",
  upload.single("profilePicture"), // This expects a field named "profilePicture"
  uploadProfilePic,auth
);







// router.post('/profile/upload-picture/:id',auth,upload.single("file"),uploadProfilePic)




//chatgtp-tubo3.5 route

router.post('/run-prompt',authenticateApiKey, handleRunPrompt);








// Issue Routes //
router.get("/issues", auth, getallIssue);
router.post(
  "/create-issue",
  auth, upload.single("file"),
  createIssue);
router.put("/update-issue/:id", auth,  upload.single("file"), updateIssue);
router.delete("/delete-issue/:id",auth, deleteIssue);


// Like an Issue

router.put('/issues/:issueId',auth, likeIssue);

router.put('/issues/:issueId/comments/:commentId/like',auth,likeCommentIssue);


router.delete('/profiles/:userId/shared-issues/:issueId', auth, deleteSharedIssue);

// Share an Issue
router.post('/issues/:issueId/share', auth, shareIssue);

router.delete('/issues/:issueId/:commentId/delete',auth,deleteCommentIssue);



// update comment //

router.put('/issues/:issueId/:commentId/update',auth,updateCommentIssue);



// Comment on an Issue
router.post('/issues/:issueId/comment',auth, commentIssue);















// Learn Routes //
router.get("/learn", auth, getallLearn);
router.post(
  "/create-learn",
  auth,upload.single("file"),
  createLearn
);
router.put("/update-learn/:id", auth, upload.single("file"),updateLearn);

router.delete("/delete-learn/:id", auth, deleteLearn);

router.put('/learns/:learnId',auth, likeLearn);

// Share an Learn
router.post('/learns/:learnId/share',auth, shareLearn);


router.delete('/profiles/:userId/shared-learns/:learnId', auth, deleteSharedLearn);

// Comment on an Learn
router.post('/learns/:learnId/comment',auth,commentLearn);
// Comment on an article


// delete comment //

router.delete('/learns/:learnId/:commentId/delete',auth,deleteCommentLearn);



// update comment //

router.put('/learns/:learnId/:commentId/update',auth,updateCommentLearn);


//like on comment


router.put('/learns/:learnId/comments/:commentId/like',auth,likeCommentLearn);










  // likes Route //

// router.get("/like", auth,likeArticle);

//   // Comments Route //

//   router.post("/comment/:id",auth,commentArticle);


// Like an article
router.put('/articles/:articleId',auth, likeArticle);


router.get('/notifications/:userId', auth, getNotifications);

// Share an article
router.post('/articles/:articleId/share',auth, shareArticle);

// fetchShared Article

router.get('/profiles/:userId/shared-articles', auth, fetchSharedArticles);


// Delete a shared article
router.delete('/profiles/:userId/shared-articles/:articleId', auth, deleteSharedArticle);


// Comment on an article
router.post('/articles/:articleId/comment',auth, commentArticle);

// delete comment //

router.delete('/articles/:articleId/:commentId/delete',auth,deleteComment);



// update comment //

router.put('/articles/:articleId/:commentId/update',auth,updateComment);


//like on comment


router.put('/articles/:articleId/comments/:commentId/like',auth,likeComment);



//like on reply


router.put('/articles/:articleId/comments/:commentId/:replyId/like',auth,likeReply);



// edit reply
router.put('/articles/:articleId/comments/:commentId/:replyId/edit', auth, editReply);


// delete reply
router.delete('/articles/:articleId/comments/:commentId/:replyId/delete', auth, deleteReply);

//Reply on comment//
router.post('/articles/comments/:commentId/:articleId/replies',auth,replyComment);

// nested reply//
router.post('/articles/:articleId/comments/:commentId/replies/:replyId',auth, nestedReply);




// Like an Learn




router.get('/getJobs-api' ,auth,getAllapi);

// get youtube videos //

router.get('/videos' ,Videos);

router.get('/saveYouTubeData' ,auth,saveYouTubeData);

router.get('/get-libary' , auth,getLibary);
// save libary data //

router.get('/save' , saveResult);

 
// Search for youtube videos //
router.post('/search-learn/:query' ,auth, searchLearnData);

// Search for libary videos //
router.post('/search-libary/:query' , auth, searchLibaryData);

// Search for jobs //
// router.get('/search-job/:term' , auth,getRapidjobs);
router.get('/search-job/:term' ,fetchAndSaveJobs);

router.get('/job-suggestions', getJobSuggestions); // New route for job suggestions

router.get('/location-suggestions', getLocationSuggestions);




// router.get('/search-job/:term', getRapidjobs);
router.get('/get-all-jobs',auth, getAllApiJobs);
router.get('/search-jobs',auth, searchJobsInDB); 








// Stripe Payment Routes //
// router.post('/create-customer',auth,createCustomer);
// router.post('/add-card',addNewCard);
// router.post('/create-charge',createCharges);

// router.post('/:id', auth, payforProduct);

export default router;
