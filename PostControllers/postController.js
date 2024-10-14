import { Article ,ReplyModel} from "../Models/article.js";
import { Job } from "../Models/job.js";
import { Issue } from "../Models/issue.js";
import { Learn } from "../Models/learn.js";
import {Like} from "../Models/like.js"
import { Share } from "../Models/share.js";
import {Comment} from "../Models/comment.js"
import { Libary } from "../Models/libary.js";
import { User } from "../Models/userModel.js";
import { Profile } from "../Models/userprofile.js";
// import io from "../index.js"
import Notification from "../Models/notification.js"
import { JobApi } from "../Models/apiJobs.js";
import { v2 as cloudinary } from 'cloudinary';
// import {Reply} from "../Models/reply.js"
// import  pusher  from '../index.js';
import Pusher from 'pusher';
// import {emitLikeNotification,emitCommentNotification} from "../Socket/socket.js"
import axios from "axios";

// import { Configuration, OpenAIApi } from 'openai';
// import { Configuration, OpenAIApi } from "openai"
import  { OpenAIApi,Configuration } from 'openai';






const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,  // Pusher App ID
  key: process.env.PUSHER_KEY,       // Pusher Key
  secret: process.env.PUSHER_SECRET, // Pusher Secret
  cluster: process.env.PUSHER_CLUSTER, // Pusher Cluster
  useTLS: true                      // Enable TLS (required for secure connections)
});









// OpenAI Configuration
const config = new Configuration({
  apiKey: "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"
});

const openai = new OpenAIApi(config);

// Run Prompt Function
export const runPrompt = async (prompt) => {
  try {
    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are an assistant that provides answers in JSON format.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 2048,
      temperature: 1,
    });

    const parsableJSONresponse = response.data.choices[0].message.content.trim();

    // Try to parse the response, catch any JSON parsing errors
    try {
      const parsedResponse = JSON.parse(parsableJSONresponse);
      return { success: true, data: parsedResponse };
    } catch (jsonError) {
      return { success: false, error: 'Error parsing JSON response', details: jsonError, response: parsableJSONresponse };
    }
  } catch (apiError) {
    return { success: false, error: 'Error from OpenAI API', details: apiError };
  }
};

// API Endpoint Handler
export const handleRunPrompt = async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ success: false, error: 'Prompt is required' });
  }

  const result = await runPrompt(prompt);
  if (result.success) {
    res.status(200).json(result.data);
  } else {
    res.status(500).json({ success: false, error: result.error, details: result.details });
  }
};



















// Like an article
export const likeArticle = async (req, res) => {
 
  try {
    const { articleId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    console.log('adhashd')
    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


 // Create a new notification
 if (article.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: article.userId,
    type: 'like',
    article: article._id,
    message: `${user.firstName} ${user.lastName} liked your article.`,
  });

  await notification.save();



  // Send a real-time notification using Pusher
  pusher.trigger('article-channel', 'like-article', {
    articleId,
    userId,
    message: `${user.firstName} ${user.lastName} liked yoursSSSSsss article.`,
  });



  // Emit socket event to the article owner
  // io.to(article.userId.toString()).emit('notification', notification,{ articleId, userId });
}

    // Check if the user has already liked the article
    const existingLikeIndex = article.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (existingLikeIndex === -1) {
      // If user hasn't liked the article yet, like it
      article.likedBy.push(userProfile);
      article.likes += 1;
           // Emit a socket event that the article was liked
          //  io.emit('like_article', { articleId, userId });
           console.log(articleId)
    } else {
      // If user has already liked the article, unlike it
      article.likedBy.splice(existingLikeIndex, 1);
      article.likes -= 1;
      // Emit a socket event that the article was unliked
      // io.emit('article_unliked', { articleId, userId });
    }

    await article.save();

    // Emit a socket event to notify clients about the updated like count
    // emitLikeNotification(articleId, article.likes);

    res.status(200).json({
      articleId,
      likes: article.likes,
      likedBy: article.likedBy,
      message: 'Article liked/unliked successfully.',
    });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ message: 'An error occurred while liking the article.', error: error.message });
  }

};




//  like on comment //

export const likeComment = async (req,res)=>{


  try {
    const { articleId, commentId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Fetch the comment
    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


// Create a new notification
if (comment.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: comment.userId,
    type: 'like',
    article: article._id,
    message: `${user.firstName} ${user.lastName} liked your comment.`,
  });

  await notification.save();

  pusher.trigger('article-channel', 'like-comment', {
    articleId,
    commentId,
    userId,
  
  });

  // Emit socket event to the article owner
  // io.to(article.userId.toString()).emit('notification', notification,{ articleId, userId });
}





    // Check if user already liked the comment
    const likedIndex = comment.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (likedIndex === -1) {
      // If user hasn't liked the comment yet, like it
      comment.likedBy.push(userProfile);
      comment.likes += 1;
    } else {
      // If user has already liked the comment, unlike it
      comment.likedBy.splice(likedIndex, 1);
      comment.likes -= 1;
    }

    await article.save();

    res.json({
      articleId,
      commentId,
      likes: comment.likes,
      likedBy: comment.likedBy,
    });
  } catch (error) {
    console.error(error); // Add logging for debugging
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}







//  like on comment //

export const likeCommentJob = async (req,res)=>{


  try {
    const { jobId, commentId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the jobs
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Fetch the comment
    const comment = job.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


// Create a new notification
if (comment.userId.toString() !== userId) {
  // Create notification only if the job is not liked by its owner
  const notification = new Notification({
    user: comment.userId,
    type: 'like',
    job: job._id,
    message: `${user.firstName} ${user.lastName} liked your comment.`,
  });

  await notification.save();


  pusher.trigger('job-channel', 'like-comment-job', {
    jobId,
    userId,
  
  });

  // Emit socket event to the article owner
  // io.to(job.userId.toString()).emit('notification', notification,{ jobId, userId });
}





    // Check if user already liked the comment
    const likedIndex = comment.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (likedIndex === -1) {
      // If user hasn't liked the comment yet, like it
      comment.likedBy.push(userProfile);
      comment.likes += 1;
    } else {
      // If user has already liked the comment, unlike it
      comment.likedBy.splice(likedIndex, 1);
      comment.likes -= 1;
    }

    await job.save();

    res.json({
      jobId,
      commentId,
      likes: comment.likes,
      likedBy: comment.likedBy,
    });
  } catch (error) {
    console.error(error); // Add logging for debugging
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}






// Comment on an job
export const commentJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    // const {userId} = req.params;
    console.log(jobId);
  

    const { text} = req.body;
    const userId = req.userId; 


  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }


    // Create a new comment
    const comment = new Comment({ userId:req.userId, job: jobId, text });
    await comment.save();
  
    const job = await Job.findByIdAndUpdate(jobId, {
      
        $push: { comments:{
            _id: comment._id, 
            text: comment.text,
           userId:comment.userId,
           userId: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
          //  file:comment.file
        } 
                 
             },
          
    });

 // Create a new notification
 if (job.userId.toString() !== userId) {
  // Create notification only if the job is not liked by its owner
  const notification = new Notification({
    user: job.userId,
    type: 'comment',
    job: job._id,
    message: `${user.firstName} ${user.lastName} comment on your job.`,
  });

  await notification.save();

  
  pusher.trigger('job-channel', 'new-comment-job', {
    jobId,
    userId,
  
  });
  // Emit socket event to the job owner
  // io.to(job.userId.toString()).emit('notification', notification,{ jobId, userId });
}

await job.save();
    res.status(200).json({ message: 'Comment added successfully.',job});
  } catch (error) {
    console.error('Error commenting on article:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the article.' });
  }
};


// Delete a comment
export const deleteCommentJob = async (req, res) => {
  try {
    const { jobId, commentId } = req.params;

    // Find the job and remove the comment from the comments array
    const job = await Job.findByIdAndUpdate(
      jobId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    res.status(200).json({ message: 'Comment deleted successfully.', job });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'An error occurred while deleting the comment.' });
  }
};


// Update a comment

export const updateCommentJob = async (req, res) => {
  try {
    const { jobId, commentId } = req.params;
    const { newText } = req.body;

    // Find the job and the comment to edit
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: "Article not found" });
    }

    const comment = job.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment text
    comment.text = newText;

    // Save the updated job
    const updatedJob = await job.save();

    res.status(200).json({ message: "Comment edited successfully", updatedJob });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'An error occurred while editing the comment' });
  }
};






















export const getNotifications = async (req, res) => {
  try {
  const { userId } = req.params;
  const notification = await Notification.find({ user: userId }).sort({ createdAt: -1 });
  const messages = notification.map(notification => notification.message);
  console.log(messages)
  res.status(200).json({
    notification
  });

}catch(err){
  console.error('Error fetching notifications:', err.message);

}



};












//like on reply//

export const likeReply = async (req, res) => {
  try {
    const { articleId, replyId, commentId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Fetch the comment

    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Fetch the reply
    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // Check if user already liked the reply
    const likedIndex = reply.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (likedIndex === -1) {
      // If user hasn't liked the reply yet, like it
      reply.likedBy.push(userProfile);
      reply.likes += 1;
    } else {
      // If user has already liked the reply, unlike it
      reply.likedBy.splice(likedIndex, 1);
      reply.likes -= 1;
    }

    await article.save();

    res.json({
      articleId,
      commentId,
      replyId,
      likes: reply.likes,
      likedBy: reply.likedBy,
    });
  } catch (error) {
    console.error('Error liking reply:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};

// edit reply //
export const editReply = async (req, res) => {
  try {
    const { articleId, commentId, replyId } = req.params;
    const { newText } = req.body; // Assuming the new text is sent in the request body

    // Fetch the article
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Fetch the comment
    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Fetch the reply
    const reply = comment.replies.id(replyId);
    if (!reply) {
      return res.status(404).json({ message: 'Reply not found' });
    }

    // Update the reply text
    reply.text = newText;

    await article.save();

    res.json({
      articleId,
      commentId,
      replyId,
      reply,
    });
  } catch (error) {
    console.error('Error editing reply:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};



// delete reply

export const deleteReply = async (req, res) => {
  try {
    const { articleId, commentId, replyId } = req.params;

    // Fetch the article
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Fetch the comment
    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Filter out the reply from the replies array
    const updatedReplies = comment.replies.filter(reply => reply._id.toString() !== replyId);

    // Update the comment's replies with the filtered array
    comment.replies = updatedReplies;

    await article.save();

    res.json({
      message: 'Reply deleted successfully',
      articleId,
      commentId,
      replyId,
    });
  } catch (error) {
    console.error('Error deleting reply:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};










// Comment on an article
export const commentArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    // const {userId} = req.params;
    console.log(articleId);
    // console.log(userId); 

    const { text} = req.body;
    const userId = req.userId; 
    // const file  = req.file;
  
    
    // if (!file || !file.originalname) {
    //   return res.status(400).json({ message: 'Invalid file data' });
    // }
  
  
  //   const att = {
  //     name: file.originalname,
  //     fileInfo:{
  //       size: file.size,
  //       mimetype: file.mimetype,
  //       location: file.location,
  //     },
  //     fileBucket: file.bucket,
  //     fileKey: file.key,
  //     location: file.location,
  //     contentType: file.mimetype,
  // };

  // const commentfile = new Comment({
  // file:att,
  // text,
  //   userId: req.userId,
  // });
   


  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }


    // Create a new comment
    const comment = new Comment({ userId:req.userId, article: articleId, text });
    await comment.save();
  
    const article = await Article.findByIdAndUpdate(articleId, {
      
        $push: { comments:{
            _id: comment._id, 
            text: comment.text,
           userId:comment.userId,
           userId: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
          //  file:comment.file
        } 
                 
             },
          
    });

 // Create a new notification
 if (article.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: article.userId,
    type: 'comment',
    article: article._id,
    message: `${user.firstName} ${user.lastName} comment on your article.`,
  });

  await notification.save();
  
  
  pusher.trigger('article-channel', 'new-comment', {
    articleId,
    userId,
    commentText,
    message: `User ${userId} commented on article ${articleId}.`,
  });


  // Emit socket event to the article owner
  // io.to(article.userId.toString()).emit('notification', notification,{ articleId, userId });
}

await article.save();
    res.status(200).json({ message: 'Comment added successfully.',article});
  } catch (error) {
    console.error('Error commenting on article:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the article.' });
  }
};


// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;

    // Find the article and remove the comment from the comments array
    const article = await Article.findByIdAndUpdate(
      articleId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    res.status(200).json({ message: 'Comment deleted successfully.', article });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'An error occurred while deleting the comment.' });
  }
};


// Update a comment

export const updateComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const { newText } = req.body;

    // Find the article and the comment to edit
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment text
    comment.text = newText;

    // Save the updated article
    const updatedArticle = await article.save();

    res.status(200).json({ message: "Comment edited successfully", updatedArticle });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'An error occurred while editing the comment' });
  }
};





//  Reply Comment api  //
//  Reply Comment api
export const replyComment = async (req, res) => {
  try {
    const { articleId, commentId } = req.params;
    const { text } = req.body;
    const userId = req.userId;

    // Find the article by ID
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    // Find the comment within the article
    const comment = article.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new reply
    const newReply = new ReplyModel({
      userId: user._id,
      text,
      firstName: user.firstName,
      lastName: user.lastName,
    });

    // Push the new reply to the replies array of the comment
    comment.replies.push(newReply);
    await newReply.save();
    await article.save();

    res.status(201).json({ message: 'Reply added successfully', reply: newReply });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
// export const replyComment = async (req, res) => {
//   try {
//     const { articleId, commentId } = req.params;
//     const { text } = req.body;
//   const userId = req.userId
//     // Find the article by ID
//     const article = await Article.findById(articleId);
//     if (!article) {
//       return res.status(404).json({ message: 'Article not found' });
//     }

//     // Find the comment within the article
//     const comment = article.comments.id(commentId);
//     if (!comment) {
//       return res.status(404).json({ message: 'Comment not found' });
//     }


//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

    
//     // Create a new reply
//     const newReply = {
//       userId: req.userId, // Assuming you have user ID in the request
//       text,
//       userId: user._id,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     };

//     // Push the new reply to the replies array of the comment
//     comment.replies.push(newReply);

//     // Save the updated article
//     await article.save();

//     res.status(201).json({ message: 'Reply added successfully', reply: newReply });
//   } catch (error) {
//     console.error('Error adding reply:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };



// Nested Reply api
// Nested Reply API
export const nestedReply = async (req, res) => {
 
 try {
        const { articleId, commentId, replyId } = req.params;
        const { text } = req.body;
        const userId = req.userId;

        // Find the article by ID
        const article = await Article.findById(articleId);
        if (!article) return res.status(404).json({ message: 'Article not found' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Find the comment within the article
        const comment = article.comments.id(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Create a new reply
        const newReply = new ReplyModel({
            userId: user._id,
            text,
            firstName: user.firstName,
            lastName: user.lastName,
            replies: [],
        });

        if (replyId) {
            // If replyId is present, we are replying to another reply
            const parentReply = comment.replies.id(replyId);
            if (!parentReply) return res.status(404).json({ message: 'Parent reply not found' });


            if (!parentReply.replies) {
              parentReply.replies = [];
            }

            // Push the new reply to the replies array of the parent reply
            parentReply.replies.push(newReply);
        } else {
            // Otherwise, we are replying to the comment
            comment.replies.push(newReply);
        }

        // Save the updated article
        await article.save();

        res.status(201).json({ message: 'Nested reply added successfully', reply: newReply });
    } catch (error) {
        console.error('Error adding nested reply:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
  // try {
  //   const { articleId, commentId, replyId } = req.params;
  //   const { text } = req.body;
  //   const userId = req.userId;

  //   // Find the article by ID
  //   const article = await Article.findById(articleId);
    
  //   if (!article) return res.status(404).json({ message: 'Article not found' });

  //   const user = await User.findById(userId);
  //   if (!user) {
  //     return res.status(404).json({ message: 'User not found' });
  //   }
  //   // Find the comment within the article
  //   const comment = article.comments.id(commentId);
  //   if (!comment) return res.status(404).json({ message: 'Comment not found' });

  //   // Find the parent reply
  //   const parentReply = comment.replies.id(replyId);
  //   if (!parentReply) return res.status(404).json({ message: 'Parent reply not found' });

  //   // Create a new reply
  //   const newReply = new ReplyModel({
  //     userId: user._id,
  //     text,
  //     firstName: user.firstName,
  //     lastName: user.lastName,
  //     replies: [], 
  //   });


  //   // Push the new reply to the replies array of the parent reply
  //   parentReply.replies.push(newReply);

  //   // Save the updated article
  //   await article.save();

  //   res.status(201).json({ message: 'Nested reply added successfully', reply: newReply });
  // } catch (error) {
  //   console.error('Error adding nested reply:', error);
  //   res.status(500).json({ message: 'Internal server error' });
  // }
};

// export const nestedReply = async(req,res)=>{

// //   const { articleId, commentId, replyId } = req.params;
// //   const { text } = req.body;
// //   const userId = req.userId; // Assuming user id is available in req.user
// // console.log(replyId)
// //   try {

// //     const article = await Article.findById(articleId).populate({
// //       path: 'comments.replies',
// //       model: ReplyModel
// //   });
// //   if (!article) return res.status(404).json({ message: 'Article not found' });

// //       const comment = article.comments.id(commentId);
// //       if (!comment) return res.status(404).json({ message: 'Comment not found' });

// //       const user = await User.findById(userId);
// //       if (!user) return res.status(404).json({ message: 'User not found' });

// //       let newReply;
      
// //       if (replyId) {
// //           const parentReply = await ReplyModel.findById(replyId);
// //           if (!parentReply) return res.status(404).json({ message: 'Parent reply not found' });

// //           newReply = new ReplyModel({
// //               userId: user._id,
// //               firstName: user.firstName,
// //               lastName: user.lastName,
// //               text,
// //           });
// //           parentReply.replies.push(newReply._id);
// //           await newReply.save();

// //           await parentReply.save();
// //       } else {
// //           newReply = new ReplyModel({
// //               userId: user._id,
// //               firstName: user.firstName,
// //               lastName: user.lastName,
// //               text,
// //           });
// //           comment.replies.push(newReply);
// //       }

// //       await newReply.save();
// //       await article.save();
      
// //       res.status(200).json(article);
// //   } catch (err) {
// //       res.status(400).json({ message: err.message });
// //   }


// }









// export const replyComment = async(req,res)=>{

//   try {
//     const { commentId } = req.params;
//     const { text } = req.body;
    
//     // Find the comment by ID
//     const comment = await Comment.findById(commentId);
//     if (!comment) {
//       return res.status(404).json({ message: 'Comment not found' });
//     }

//     // Create a new reply
//     const newReply = new Reply({
//       text,
//       comment: commentId,
//       // Add other fields if needed (e.g., user ID, timestamp, etc.)
//     });

//     // Save the reply to the database
//     await newReply.save();

//     // Append the reply to the comment's replies array
//     comment.replies.push(newReply._id);
//     await comment.save();

//     res.status(201).json({ message: 'Reply added successfully', reply: newReply });
//   } catch (error) {
//     console.error('Error adding reply:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }



// }





// Share an article
// Share an article

export const shareArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const userId = req.userId; // Assuming you get the userId from the authenticated user

    // Check if the article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: 'Article not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Create a new share record (assuming you have a Share schema)
    const share = new Share({ user: userId, article: articleId });
    await share.save();

    if (article.userId.toString() !== userId) {
      // Create notification only if the article is not liked by its owner
      const notification = new Notification({
        user: article.userId,
        type: 'share',
        article: article._id,
        message: `${user.firstName} ${user.lastName} shared your article.`,
      });
    
      await notification.save();

      pusher.trigger('article-channel', 'share-article', {
        articleId,
        userId,
        message: `User ${userId} shared article ${articleId}.`,
      });
    
      // Emit socket event to the article owner
      // io.to(article.userId.toString()).emit('notification', notification,{ articleId, userId });
    }

    // Update the article's share count
    const updatedArticle = await Article.findByIdAndUpdate(articleId, { $inc: { shares: 1 } }, { new: true });

    // Check if the user's profile exists
    const profile = await Profile.findOne({ userId: userId }); // Use userId field correctly
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Update the user's profile to include the shared article
    profile.sharedArticles.addToSet(articleId); // Add articleId to sharedArticles array
    const updatedProfile = await profile.save();

    res.status(200).json({ message: 'Article shared successfully.', sharedArticle: updatedArticle, updatedProfile });
  } catch (error) {
    console.error('Error sharing article:', error);
    res.status(500).json({ message: 'An error occurred while sharing the article.' });
  }
};



// In controllers.js or similar file

export const deleteSharedArticle = async (req, res) => {
  try {
    const { userId, articleId } = req.params;

    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Remove the article reference from the sharedArticles array
    profile.sharedArticles.pull(articleId);
    await profile.save();

    res.status(200).json({ message: 'Shared article removed successfully.' });
  } catch (error) {
    console.error('Error deleting shared article:', error);
    res.status(500).json({ message: 'An error occurred while deleting the shared article.' });
  }
};




export const uploadProfilePic = async (req, res) => {
  const { file } = req;
  const profileId = req.params.id; // Assuming this is the user ID
  
  try {
   if (!file) {
     return res.status(400).json({ message: 'No file uploaded' });
   }
  
   // Upload image to Cloudinary
   const result = await cloudinary.uploader.upload(file.path, {
     folder: 'profile_pictures', // Optional folder organization in Cloudinary
   });
  
   // Save the full URL in the profile
  //  const updatedProfile = await Profile.findOneAndUpdate(
  //    { profileId },
  //    {}, // Save the full URL in profile
  //    { new: true }
  //  );
   const updatedProfile = await Profile.findByIdAndUpdate(
          profileId,
          {  profilePicture: result.secure_url },
          { new: true }
        );
    
  
   res.json({ message: 'Profile picture updated successfully', url: result.secure_url ,profile: updatedProfile,});
  } catch (error) {
   console.error('Error uploading profile picture:', error);
   res.status(500).json({ message: 'Internal server error' });
  }
  };






// export const uploadProfilePic = async (req, res) => {

//   try {
//     const profileId = req.params.id;

//     // Ensure a file was uploaded
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     // Get the uploaded file's path
//     const profilePictureUrl = `${req.file.filename}`;

//     // Update the user's profile with the new profile picture URL
//     const updatedProfile = await Profile.findByIdAndUpdate(
//       profileId,
//       { profilePicture: profilePictureUrl },
//       { new: true }
//     );

//     if (!updatedProfile) {
//       return res.status(404).json({ message: "Profile not found" });
//     }

//     res.status(200).json({
//       message: "Profile picture uploaded successfully",
//       profile: updatedProfile,
//     });
//   } catch (error) {
//     console.error("Error uploading profile picture:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };










export const fetchSharedJobs = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user's profile to get shared jobs
    const profile = await Profile.findOne({ userId }).populate('sharedJobs');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Fetch the jobs details
    const sharedJobs = await Job.find({ _id: { $in: profile.sharedJobs } });

    res.status(200).json({ sharedJobs });
  } catch (error) {
    console.error('Error fetching shared jobs:', error);
    res.status(500).json({ message: 'An error occurred while fetching shared articles.' });
  }
};



export const shareJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId; // Assuming you get the userId from the authenticated user

    // Check if the job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new share record (assuming you have a Share schema)
    const share = new Share({ user: userId, job: jobId });
    await share.save();

    if (job.userId.toString() !== userId) {
      // Create notification only if the job is not shared by its owner
      const notification = new Notification({
        user: job.userId,
        type: 'share',
        job: job._id,
        message: `${user.firstName} ${user.lastName} shared your job post.`,
      });

      await notification.save();


      
      pusher.trigger('job-channel', 'share-job', {
        jobId,
        userId,
        message: `User ${userId} shared article ${jobId}.`,
      });
    
      // Emit socket event to the job owner
      // io.to(job.userId.toString()).emit('notification', notification, { jobId, userId });
    }

    // Update the job's share count
    const updatedJob = await Job.findByIdAndUpdate(jobId, { $inc: { shares: 1 } }, { new: true });

    // Check if the user's profile exists
    const profile = await Profile.findOne({ userId: userId });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Update the user's profile to include the shared job
    profile.sharedJobs.addToSet(jobId);
    const updatedProfile = await profile.save();

    res.status(200).json({ message: 'Job shared successfully.', sharedJob: updatedJob, updatedProfile });
  } catch (error) {
    console.error('Error sharing job:', error);
    res.status(500).json({ message: 'An error occurred while sharing the job.' });
  }
};


// export const shareJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const userId = req.userId; // Assuming you get the userId from the authenticated user
// console.log('dsdsds')
//     // Check if the article exists
//     const job = await Job.findById(jobId);
//     if (!job) {
//       return res.status(404).json({ message: 'Job not found' });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Create a new share record (assuming you have a Share schema)
//     const share = new Share({ user: userId, job: jobId });
//     await share.save();

//     if (job.userId.toString() !== userId) {
//       // Create notification only if the job is not liked by its owner
//       const notification = new Notification({
//         user: job.userId,
//         type: 'share',
//         job: job._id,
//         message: `${user.firstName} ${user.lastName} shared your job.`,
//       });
    
//       await notification.save();
    
//       // Emit socket event to the article owner
//       io.to(job.userId.toString()).emit('notification', notification,{ jobId, userId });
//     }

//     // Update the job's share count
//     const updatedShared = await Job.findByIdAndUpdate(jobId, { $inc: { shares: 1 } }, { new: true });

//     // Check if the user's profile exists
//     const profile = await Profile.findOne({ userId: userId }); // Use userId field correctly
//     if (!profile) {
//       return res.status(404).json({ message: 'User profile not found' });
//     }

//     // Update the user's profile to include the shared job
//     profile.sharedJobs.addToSet(jobId); // Add jobId to sharedJobs array
//     const updatedProfile = await profile.save();

//     res.status(200).json({ message: 'Job shared successfully.', sharedJob: updatedShared, updatedProfile });
//   } catch (error) {
//     console.error('Error sharing jobs:', error);
//     res.status(500).json({ message: 'An error occurred while sharing the job.' });
//   }
// };





export const deleteSharedJob = async (req, res) => {
  try {
    const { userId, jobId } = req.params;

    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Remove the article reference from the sharedArticles array
    profile.sharedJobs.pull(jobId);
    await profile.save();

    res.status(200).json({ message: 'Shared  removed successfully.' });
  } catch (error) {
    console.error('Error deleting sharedJobs article:', error);
    res.status(500).json({ message: 'An error occurred while deleting the shared article.' });
  }
};




export const fetchSharedArticles = async (req, res) => {
  try {
    const { userId } = req.params;

    // Fetch the user's profile to get shared articles
    const profile = await Profile.findOne({ userId }).populate('sharedArticles');
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Fetch the articles details
    const sharedArticles = await Article.find({ _id: { $in: profile.sharedArticles } });

    res.status(200).json({ sharedArticles });
  } catch (error) {
    console.error('Error fetching shared articles:', error);
    res.status(500).json({ message: 'An error occurred while fetching shared articles.' });
  }
};







// export const shareArticle = async (req, res) => {
//   try {
//     const { articleId , userId} = req.params;

//      // Create a new like
//      const share = new Share({ user: userId, article: articleId });
//      await share.save();
    
    
    
//     // Update the article's share count
//     await Article.findByIdAndUpdate(articleId, { $inc: { shares: 1 } });



//     res.status(200).json({ message: 'Article shared successfully.' });
//   } catch (error) {
//     console.error('Error sharing article:', error);
//     res.status(500).json({ message: 'An error occurred while sharing the article.' });
//   }
// };




export const likeCommentIssue = async (req,res)=>{


  try {
    const { issueId, commentId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Fetch the comment
    const comment = issue.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


// Create a new notification
if (comment.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: comment.userId,
    type: 'like',
    issue: issue._id,
    message: `${user.firstName} ${user.lastName} liked your comment.`,
  });

  await notification.save();

  // Emit socket event to the article owner
  pusher.trigger('issue-channel', 'like-issue-comment', {
    issueId,
    userId,
    message: `${user.firstName} ${user.lastName} liked yoursSSSSsss comment.`,
  });

  // io.to(issue.userId.toString()).emit('notification', notification,{ issueId, userId });
}





    // Check if user already liked the comment
    const likedIndex = comment.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (likedIndex === -1) {
      // If user hasn't liked the comment yet, like it
      comment.likedBy.push(userProfile);
      comment.likes += 1;
    } else {
      // If user has already liked the comment, unlike it
      comment.likedBy.splice(likedIndex, 1);
      comment.likes -= 1;
    }

    await issue.save();

    res.json({
      issueId,
      commentId,
      likes: comment.likes,
      likedBy: comment.likedBy,
    });
  } catch (error) {
    console.error(error); // Add logging for debugging
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}










// Like an Issue
export const likeIssue = async (req, res) => {

  try {
    const { issueId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    console.log('adhashd')
    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


 // Create a new notification
 if (issue.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: issue.userId,
    type: 'like',
    issue: issue._id,
    message: `${user.firstName} ${user.lastName} liked your Issue.`,
  });

  await notification.save();

  // Emit socket event to the article owner
  pusher.trigger('issue-channel', 'like-issue', {
    issueId,
    userId,
    message: `${user.firstName} ${user.lastName} liked yoursSSSSsss issue.`,
  });

  // io.to(issue.userId.toString()).emit('notification', notification,{ issueId, userId });
}

    // Check if the user has already liked the article
    const existingLikeIndex = issue.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (existingLikeIndex === -1) {
      // If user hasn't liked the article yet, like it
      issue.likedBy.push(userProfile);
      issue.likes += 1;
           // Emit a socket event that the article was liked
          //  io.emit('like_article', { articleId, userId });
           console.log(issue)
    } else {
      // If user has already liked the article, unlike it
      issue.likedBy.splice(existingLikeIndex, 1);
      issue.likes -= 1;
      // Emit a socket event that the article was unliked
      // io.emit('article_unliked', { articleId, userId });
    }

    await issue.save();

    // Emit a socket event to notify clients about the updated like count
    // emitLikeNotification(articleId, article.likes);

    res.status(200).json({
      issueId,
      likes: issue.likes,
      likedBy: issue.likedBy,
      message: 'Issue liked/unliked successfully.',
    });
  } catch (error) {
    console.error('Error liking issue:', error);
    res.status(500).json({ message: 'An error occurred while liking the article.', error: error.message });
  }
 
};



// Comment on an  Issue
export const commentIssue = async (req, res) => {
  try {
    const { issueId } = req.params;


    const { text} = req.body;
    const userId = req.userId; 

  
    



  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }


    // Create a new comment
    const comment = new Comment({ userId:req.userId, issue: issueId, text });
    await comment.save();
  
    const issue = await Issue.findByIdAndUpdate(issueId, {
      
        $push: { comments:{
            _id: comment._id, 
            text: comment.text,
           userId:comment.userId,
           userId: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
          //  file:comment.file
        } 
                 
             },
          
    });

 // Create a new notification
 if (issue.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: issue.userId,
    type: 'comment',
    issue: issue._id,
    message: `${user.firstName} ${user.lastName} comment on your issue.`,
  });

  await notification.save();

  // Emit socket event to the article owner
    
  pusher.trigger('issue-channel', 'new-comment', {
    issueId,
    userId,
    commentText,
    message: `User ${userId} commented on article ${issueId}.`,
  });
  // io.to(issue.userId.toString()).emit('notification', notification,{ issueId, userId });
}

await issue.save();
    res.status(200).json({ message: 'Comment added successfully.',issue});
  } catch (error) {
    console.error('Error commenting on article:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the article.' });
  }
};






export const updateCommentIssue = async (req, res) => {
  try {
    const { issueId, commentId } = req.params;
    const { newText } = req.body;

    // Find the article and the comment to edit
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: "issue not found" });
    }

    const comment = issue.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment text
    comment.text = newText;

    // Save the updated article
    const updatedIssue = await issue.save();

    res.status(200).json({ message: "Comment edited successfully", updatedIssue });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'An error occurred while editing the comment' });
  }
};





export const deleteCommentIssue = async (req, res) => {
  try {
    const { issueId, commentId } = req.params;

    // Find the article and remove the comment from the comments array
    const issue = await Issue.findByIdAndUpdate(
      issueId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    res.status(200).json({ message: 'Comment deleted successfully.', issue });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'An error occurred while deleting the comment.' });
  }
};





export const deleteSharedIssue = async (req, res) => {
  try {
    const { userId, issueId } = req.params;

    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Remove the article reference from the sharedArticles array
    profile.sharedIssues.pull(issueId);
    await profile.save();

    res.status(200).json({ message: 'Shared issue removed successfully.' });
  } catch (error) {
    console.error('Error deleting shared article:', error);
    res.status(500).json({ message: 'An error occurred while deleting the shared article.' });
  }
};





// Share an Issue
export const shareIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const userId = req.userId; // Assuming you get the userId from the authenticated user

    // Check if the article exists
    const issue = await Issue.findById(issueId);
    if (!issue) {
      return res.status(404).json({ message: 'issue not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    // Create a new share record (assuming you have a Share schema)
    const share = new Share({ user: userId, issue: issueId });
    await share.save();

    if (issue.userId.toString() !== userId) {
      // Create notification only if the article is not liked by its owner
      const notification = new Notification({
        user: issue.userId,
        type: 'share',
        issue: issue._id,
        message: `${user.firstName} ${user.lastName} shared your issue.`,
      });
    
      await notification.save();
    
      // Emit socket event to the article owner
      // io.to(issue.userId.toString()).emit('notification', notification,{ issueId, userId });
      pusher.trigger('issue-channel', 'share-issue', {
        issueId,
        userId,
        message: `User ${userId} shared issue ${issueId}.`,
      });
    
    }

    // Update the article's share count
    const updatedIssue = await Issue.findByIdAndUpdate(issueId, { $inc: { shares: 1 } }, { new: true });

    // Check if the user's profile exists
    const profile = await Profile.findOne({ userId: userId }); // Use userId field correctly
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Update the user's profile to include the shared article
    profile.sharedIssues.addToSet(issueId); // Add articleId to sharedArticles array
    const updatedProfile = await profile.save();

    res.status(200).json({ message: 'Issue shared successfully.', sharedIssue: updatedIssue, updatedProfile });
  } catch (error) {
    console.error('Error sharing article:', error);
    res.status(500).json({ message: 'An error occurred while sharing the article.' });
  }
};





// Like an Learn
export const likeLearn = async (req, res) => {
  try {
    const { learnId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const learn = await Learn.findById(learnId);
    if (!learn) {
      return res.status(404).json({ message: 'Article not found' });
    }

    console.log('adhashd')
    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


 // Create a new notification
 if (learn.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: learn.userId,
    type: 'like',
    learn: learn._id,
    message: `${user.firstName} ${user.lastName} liked your learn.`,
  });

  await notification.save();


  pusher.trigger('learn-channel', 'like-learn', {
    learnId,
    userId,
    message: `${user.firstName} ${user.lastName} liked yoursSSSSsss learn.`,
  });
  // Emit socket event to the article owner
  // io.to(learn.userId.toString()).emit('notification', notification,{ learnId, userId });
}

    // Check if the user has already liked the article
    const existingLikeIndex = learn.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (existingLikeIndex === -1) {
      // If user hasn't liked the article yet, like it
      learn.likedBy.push(userProfile);
      learn.likes += 1;
           // Emit a socket event that the article was liked
          //  io.emit('like_article', { articleId, userId });
           console.log(learnId)
    } else {
      // If user has already liked the article, unlike it
      learn.likedBy.splice(existingLikeIndex, 1);
      learn.likes -= 1;
      // Emit a socket event that the article was unliked
      // io.emit('article_unliked', { articleId, userId });
    }

    await learn.save();

    // Emit a socket event to notify clients about the updated like count
    // emitLikeNotification(articleId, article.likes);

    res.status(200).json({
      learnId,
      likes: learn.likes,
      likedBy: learn.likedBy,
      message: 'Article liked/unliked successfully.',
    });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ message: 'An error occurred while liking the article.', error: error.message });
  }
};



// Comment on an  Learn
export const commentLearn = async (req, res) => {

  try {
    const { learnId } = req.params;


    const { text} = req.body;
    const userId = req.userId; 

  
    



  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }


    // Create a new comment
    const comment = new Comment({ userId:req.userId, learn: learnId, text });
    await comment.save();
  
    const learn = await Learn.findByIdAndUpdate(learnId, {
      
        $push: { comments:{
            _id: comment._id, 
            text: comment.text,
           userId:comment.userId,
           userId: user._id,
           firstName: user.firstName,
           lastName: user.lastName,
          //  file:comment.file
        } 
                 
             },
          
    });

 // Create a new notification
 if (learn.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: learn.userId,
    type: 'comment',
    learn: learn._id,
    message: `${user.firstName} ${user.lastName} comment on your learn.`,
  });

  await notification.save();
  pusher.trigger('learn-channel', 'new-comment', {
    learnId,
    userId,
    commentText,
    message: `User ${userId} commented on article ${learnId}.`,
  });
  // Emit socket event to the article owner
  // io.to(learn.userId.toString()).emit('notification', notification,{ learnId, userId });
}

await learn.save();
    res.status(200).json({ message: 'Comment added successfully.',learn});
  } catch (error) {
    console.error('Error commenting on article:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the learn.' });
  }


 
};




export const shareLearn = async (req, res) => {
  try {
    const { learnId } = req.params;
    const userId = req.userId; // Assuming you get the userId from the authenticated user

    // Check if the learn exists
    const learn = await Learn.findById(learnId);
    if (!learn) {
      return res.status(404).json({ message: 'Learn not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create a new share record (assuming you have a Share schema)
    const share = new Share({ user: userId, learn: learnId });
    await share.save();

    // Ensure that learn.userId is defined before calling .toString()
    if (learn.userId && learn.userId.toString() !== userId) {
      // Create notification only if the learn is not shared by its owner
      const notification = new Notification({
        user: learn.userId,
        type: 'share',
        learn: learn._id,
        message: `${user.firstName} ${user.lastName} shared your learn.`,
      });
    
      await notification.save();

      pusher.trigger('learn-channel', 'share-learn', {
        learnId,
        userId,
        message: `User ${userId} shared learn ${learn}.`,
      });
    }

    // Update the learn's share count
    const updatedLearn = await Learn.findByIdAndUpdate(learnId, { $inc: { shares: 1 } }, { new: true });

    // Check if the user's profile exists
    const profile = await Profile.findOne({ userId: userId });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Update the user's profile to include the shared learn
    profile.sharedLearns.addToSet(learnId); // Add learnId to sharedLearns array
    const updatedProfile = await profile.save();

    res.status(200).json({ message: 'Learn shared successfully.', sharedLearn: updatedLearn, updatedProfile });
  } catch (error) {
    console.error('Error sharing learn:', error);
    res.status(500).json({ message: 'An error occurred while sharing the learn.' });
  }
};

// Share an Learn

// export const shareLearn = async (req, res) => {
//   try {
//     const { learnId } = req.params;
//     const userId = req.userId; // Assuming you get the userId from the authenticated user

//     // Check if the article exists
//     const learn = await Learn.findById(learnId);
//     if (!learn) {
//       return res.status(404).json({ message: 'learn not found' });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }
//     // Create a new share record (assuming you have a Share schema)
//     const share = new Share({ user: userId, learn: learnId });
//     await share.save();

//     if (learn.userId.toString() !== userId) {
//       // Create notification only if the article is not liked by its owner
//       const notification = new Notification({
//         user: learn.userId,
//         type: 'share',
//         learn: learn._id,
//         message: `${user.firstName} ${user.lastName} shared your learn.`,
//       });
    
//       await notification.save();


//       pusher.trigger('learn-channel', 'share-learn', {
//         learnId,
//         userId,
//         message: `User ${userId} shared learn ${learn}.`,
//       });
    
    

    
//       // Emit socket event to the article owner
//       // io.to(learn.userId.toString()).emit('notification', notification,{ learnId, userId });
//     }

//     // Update the article's share count
//     const updatedLearn = await Learn.findByIdAndUpdate(learnId, { $inc: { shares: 1 } }, { new: true });

//     // Check if the user's profile exists
//     const profile = await Profile.findOne({ userId: userId }); // Use userId field correctly
//     if (!profile) {
//       return res.status(404).json({ message: 'User profile not found' });
//     }

//     // Update the user's profile to include the shared article
//     profile.sharedLearns.addToSet(learnId); // Add articleId to sharedArticles array
//     const updatedProfile = await profile.save();

//     res.status(200).json({ message: 'learn shared successfully.', sharedLearn: updatedLearn, updatedProfile });
//   } catch (error) {
//     console.error('Error sharing article:', error);
//     res.status(500).json({ message: 'An error occurred while sharing the learn.' });
//   }
// };





export const deleteSharedLearn = async (req, res) => {
  try {
    const { userId, learnId } = req.params;

    // Find the user's profile
    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'User profile not found' });
    }

    // Remove the article reference from the sharedArticles array
    profile.sharedLearns.pull(learnId);
    await profile.save();

    res.status(200).json({ message: 'Shared learn removed successfully.' });
  } catch (error) {
    console.error('Error deleting shared article:', error);
    res.status(500).json({ message: 'An error occurred while deleting the shared article.' });
  }
};















// Like an Job
export const likeJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ message: 'Article not found' });
    }


    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


 // Create a new notification
 if (job.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: job.userId,
    type: 'like',
    job: job._id,
    message: `${user.firstName} ${user.lastName} liked your job.`,
  });

  await notification.save();


  pusher.trigger('job-channel', 'like-job', {
    jobId,
    userId,
    message: `${user.firstName} ${user.lastName} liked yoursSSSSsss article.`,
  });

  // // Emit socket event to the article owner
  // io.to(job.userId.toString()).emit('notification', notification,{ jobId, userId });
}

    // Check if the user has already liked the article
    const existingLikeIndex = job.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (existingLikeIndex === -1) {
      // If user hasn't liked the article yet, like it
      job.likedBy.push(userProfile);
      job.likes += 1;
           // Emit a socket event that the article was liked
          //  io.emit('like_article', { articleId, userId });
           console.log(jobId)
    } else {
      // If user has already liked the article, unlike it
      job.likedBy.splice(existingLikeIndex, 1);
      job.likes -= 1;
      // Emit a socket event that the article was unliked
      // io.emit('article_unliked', { articleId, userId });
    }

    await job.save();

    // Emit a socket event to notify clients about the updated like count
    // emitLikeNotification(articleId, article.likes);

    res.status(200).json({
      jobId,
      likes: job.likes,
      likedBy: job.likedBy,
      message: 'Job liked/unliked successfully.',
    });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ message: 'An error occurred while liking the article.', error: error.message });
  }

};



// Comment on an  Job
// export const commentJob = async (req, res) => {
//   try {
//     const { jobId } = req.params;
//     const { userId } = req.params;
//     const { text} = req.body;

//     // Create a new comment
//     const comment = new Comment({ userId: userId, job:jobId, text });
//     await comment.save();
    
//     const job = await Job.findByIdAndUpdate(jobId, {
      
//       $push: { comments:{
//           _id: comment._id, 
//           text: comment.text,
//          userId:comment.userId
//       } 
               
//            },
        
//   });
 
//     res.status(200).json({ message: 'Comment added successfully.' });
//   } catch (error) {
//     console.error('Error commenting on jobId:', error);
//     res.status(500).json({ message: 'An error occurred while commenting on the issue.' });
//   }
// };




// Share an Job
// export const shareJob = async (req, res) => {
//   try {
//     const { jobId , userId } = req.params;


//       const share = new Share({user:userId,job:jobId});
//       await share.save();

//     // Update the article's share count
//     await Job.findByIdAndUpdate(jobId, { $inc: { shares: 1 } });

//     res.status(200).json({ message: 'Job shared successfully.' });
//   } catch (error) {
//     console.error('Error sharing Issue:', error);
//     res.status(500).json({ message: 'An error occurred while sharing the Issue.' });
//   }
// };
















// Get All Articles//
// export const getallArticle = async (req, res) => {
//   const article = await Article.find();

//   res.status(200).json({
//     article,
//   });
// };

export const getallArticle = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    const skip = (page - 1) * limit;

    // Get total count of documents
    const totalItems = await Article.countDocuments();

    // Fetch paginated data
    const article = await Article.find()
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'firstName lastName profilePicture')  // Dynamically fetch author details
      .exec();


    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      article,
      totalItems,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'An error occurred while fetching the articles.', error: error.message });
  }
};









// Create Article //
export const createArticle = async (req, res) => {
  const {text} = req.body;
  const file  = req.file;
  const userId = req.userId;
  // const {userId} = req.params;
  
  if (!file || !file.originalname) {
    return res.status(400).json({ message: 'Invalid file data' });
  }


  const att = {
    name: file.originalname,
    fileInfo:{
      size: file.size,
      mimetype: file.mimetype,
      location: file.location,
    },
    fileBucket: file.bucket,
    fileKey: file.key,
    location: file.location,
    contentType: file.mimetype,
};


const result = await cloudinary.uploader.upload(file.path, {
  folder: 'Article', // Optional folder organization in Cloudinary
});


const user = await User.findById(userId);
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}


const profile = await Profile.findOne({ userId });
if (!profile) {
  return res.status(404).json({ message: 'Profile not found' });
}



  
  
  const article = new Article({
    text:text,
    file:result.secure_url,
    // firstName: user.firstName,
    // lastName: user.lastName,
    userId: req.userId,
    // profilePicture: profile.profilePicture,
    author: profile._id  
  });

  await article.save();

      const populatedArticle = await Article.findById(article._id)
      .populate('author', 'firstName lastName profilePicture')
      .exec();


  res.status(201).json({
    url: result.secure_ur,
    article:populatedArticle,
    message: "succsessfully created",
  });
};

// Update Article //

export const updateArticle = async (req, res) => {

  const { id } = req.params;
  const { text } = req.body;
// const file = req.file;
//   const att = {
//     name: file.originalname,
//     fileInfo:{
//       size: file.size,
//       mimetype: file.mimetype,
//       location: file.location,
//     },
//     fileBucket: file.bucket,
//     fileKey: file.key,
//     location: file.location,
//     contentType: file.mimetype,
// };
  try {
    const article = await Article.findByIdAndUpdate(id, {text}, { new: true });

    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    res.status(200).json({
      article,
      message: "Successfully updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }



  //   const {id} = req.params;
//   const { name } = req.body;

//   // const article = {
//   //   name,

//   // };

//  const article = await Article.findByIdAndUpdate(id, {name}, { new: true });

//  await article.save();

//   res.status(200).json({
//     article,
//     message: "succsessfully updated",
//   });



};

// Delete Article //

export const deleteArticle = async (req, res) => {
  const id = req.params.id;
  const article = await Article.findByIdAndRemove(id);
  res.status(202).json({
    article,
    message: "succsessfully deleted",
  });
};






// Get All Jobs //
// export const getallJob = async (req, res) => {
//   const job = await Job.find();

//   res.status(200).json({
//     job,
//   });
// };


export const getallJob = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    const skip = (page - 1) * limit;

    // Get total count of documents
    const totalItems = await Job.countDocuments();

    // Fetch paginated data
    const job = await Job.find()
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'firstName lastName profilePicture')  // Dynamically fetch author details
      .exec();

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      job,
      totalItems,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'An error occurred while fetching the articles.', error: error.message });
  }
};




// Create Job //
export const createJob = async (req, res) => {
  const {text} = req.body;
  const file  = req.file;
  const userId = req.userId;
  // const {userId} = req.params;
  
  if (!file || !file.originalname) {
    return res.status(400).json({ message: 'Invalid file data' });
  }


  const att = {
    name: file.originalname,
    fileInfo:{
      size: file.size,
      mimetype: file.mimetype,
      location: file.location,
    },
    fileBucket: file.bucket,
    fileKey: file.key,
    location: file.location,
    contentType: file.mimetype,
};



const result = await cloudinary.uploader.upload(file.path, {
  folder: 'Jobs', // Optional folder organization in Cloudinary
});

const user = await User.findById(userId);
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}


const profile = await Profile.findOne({ userId });
if (!profile) {
  return res.status(404).json({ message: 'Profile not found' });
}


  
  
  const job = new Job({
    text:text,
    file:result.secure_url,
    userId: req.userId,
    // profilePicture: profile.profilePicture,
    author: profile._id  
  });

  await job.save();

  
const populatedArticle = await Job.findById(job._id)
.populate('author', 'firstName lastName profilePicture')
.exec();


  res.status(201).json({
    url: result.secure_ur,
    job:populatedArticle,
    message: "succsessfully created",
  });
};

// Update Job //

export const updateJob = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const job = await Job.findByIdAndUpdate(id, {text}, { new: true });

    if (!job) {
      return res.status(404).json({ message: "job not found" });
    }

    res.status(200).json({
      job,
      message: "Successfully updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Job //

export const deleteJob = async (req, res) => {
  const id = req.params.id;
  const job = await Job.findByIdAndRemove(id);
  res.status(202).json({
    job,
    message: "succsessfully deleted",
  });
};





// Get All Issues //
// export const getallIssue = async (req, res) => {
//   const issue = await Issue.find();

//   res.status(200).json({
//   issue,
//   });
// };



export const getallIssue = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    const skip = (page - 1) * limit;

    // Get total count of documents
    const totalItems = await Issue.countDocuments();

    // Fetch paginated data
    const issue = await Issue.find()
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'firstName lastName profilePicture')  // Dynamically fetch author details
      .exec();


    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      issue,
      totalItems,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching issue:', error);
    res.status(500).json({ message: 'An error occurred while fetching the articles.', error: error.message });
  }
};



// Create Issue //
export const createIssue = async (req, res) => {

  const {text} = req.body;
  const file  = req.file;
  const userId = req.userId;
  // const {userId} = req.params;
  
  if (!file || !file.originalname) {
    return res.status(400).json({ message: 'Invalid file data' });
  }


//   const att = {
//     name: file.originalname,
//     fileInfo:{
//       size: file.size,
//       mimetype: file.mimetype,
//       location: file.location,
//     },
//     fileBucket: file.bucket,
//     fileKey: file.key,
//     location: file.location,
//     contentType: file.mimetype,
// };

const result = await cloudinary.uploader.upload(file.path, {
  folder: 'Issue', // Optional folder organization in Cloudinary
});


const user = await User.findById(userId);
if (!user) {
  return res.status(404).json({ message: 'User not found' });
}


const profile = await Profile.findOne({ userId });
if (!profile) {
  return res.status(404).json({ message: 'Profile not found' });
}



  
  
  const issue = new Issue({
    text:text,
    file:result.secure_url,
    // firstName: user.firstName,
    // lastName: user.lastName,
    userId: req.userId,
    // profilePicture: profile.profilePicture,
    author: profile._id  
  });

  await issue.save();

      const populatedIssue = await Issue.findById(issue._id)
      .populate('author', 'firstName lastName profilePicture')
      .exec();


  res.status(201).json({
    issue:populatedIssue,
    message: "succsessfully created",
  });

};

// Update Issue//

export const updateIssue = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const issue = await Issue.findByIdAndUpdate(id, {text}, { new: true });

    if (!issue) {
      return res.status(404).json({ message: "issue not found" });
    }

    res.status(200).json({
      issue,
      message: "Successfully updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete issue //

export const deleteIssue = async (req, res) => {
  const id = req.params.id;
  const issue = await Issue.findByIdAndRemove(id);
  res.status(202).json({
    issue,
    message: "succsessfully deleted",
  });
};



// Search For Youtube Data Logic //

// export const searchLearnData = async (req, res) => {
//   try {
//     // Get the search query from the request
//     const { query } = req.params;

//     // Use a regex pattern to search for documents with titles matching the query (case-insensitive)
//     const caseInsensitivePattern = new RegExp(query, 'i'); // Case-insensitive search

//     // Perform the case-insensitive search in the Learn collection
//     const caseInsensitiveResults = await Learn.find({ title: caseInsensitivePattern });

//     // Use a regex pattern to search for documents with titles matching the query (case-sensitive)
//     const caseSensitivePattern = new RegExp(query); // Case-sensitive search

//     // Perform the case-sensitive search in the Learn collection
//     const caseSensitiveResults = await Learn.find({ title: caseSensitivePattern });

//     // Return both case-insensitive and case-sensitive search results
//     res.json({
//       caseInsensitiveResults: caseInsensitiveResults,
//       caseSensitiveResults: caseSensitiveResults,
//     });
//   } catch (error) {
//     console.error('Error searching Learn data:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };



    // Search For Youtube Data Logic //


export const searchLearnData = async (req, res) => {
  try {
    // Get the search query from the request
    const { query } = req.params;

    // Use a regex pattern to search for documents with titles matching the query
    const searchPattern = new RegExp(query, 'i'); // Case-insensitive search

    // Perform the search in the Learn collection
    const searchResults = await Learn.find({ title: searchPattern });

    // Return the search results
    res.json({ results: searchResults });
  } catch (error) {
    console.error('Error searching Learn data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


 // Search For Libary Data Logic //

export const searchLibaryData = async (req, res) => {
  try {
    // Get the search query from the request
    const { query } = req.params;

    // Use a regex pattern to search for documents with titles matching the query
    // const searchPattern = new RegExp(query, 'i'); // Case-insensitive search

    // Perform the search in the Learn collection
    const searchResults = await Libary.find({ productName: {$regex: ".*"+query+".*",$options:'i'} });

    // Return the search results
    res.json({ results: searchResults });
  } catch (error) {
    console.error('Error searching Libary data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};





export const saveYouTubeData = async (req, res) => {
  try {
    const userId = req.userId;
 // Assuming API key is passed in the request body

    // if (!videoId || !title || !userId || !apiKey) {
    //   return res.status(400).json({ message: 'Video ID, title, user ID, and API key are required' });
    // }
    const API_KEY = 'AIzaSyC__44NzVKI2fNImwSu_d7T8ejLGGd5BPE';
    const channelId = 'UCapzEjUWyv7H4GtPQrgybTQ';
    let nextPageToken = 'CAUQAA';

    const response = await axios.get(`https://www.googleapis.com/youtube/v3/search`, {
      params: {
       
        channelId,
        maxResults: 1,
        part: 'snippet',
        key: API_KEY
      }
    });

    const videoData = response.data.items[0];
    const videoId = videoData.videoId;
    if (!videoData) {
      return res.status(404).json({ message: 'Video not found' });
    }

    const newLearn = new Learn({
      videoId,
      title,
      userId,
     
    });

    await newLearn.save();

    res.status(201).json({ message: 'Video data saved successfully', learn: newLearn });
  } catch (error) {
    console.error('Error fetching or saving videos:', error);
    res.status(500).json({ message: 'An error occurred while fetching or saving the video data.', error: error.message });
  }
};




export const Videos = async (req, res) => {
  try {
    const userId = req.userId;
    const API_KEY = 'AIzaSyC__44NzVKI2fNImwSu_d7T8ejLGGd5BPE';
    const channelId = 'UCapzEjUWyv7H4GtPQrgybTQ';
    let nextPageToken = 'CAUQAA';
    const learnDataArray = [];

    while (true) {
      const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          channelId,
          maxResults: 1,
          type: 'video',
          key: API_KEY,
          pageToken: nextPageToken,
        },
      });

      if (response.data.error) {
        console.error('YouTube API Error:', response.data.error.message);
        res.status(500).json({ error: 'YouTube API error' });
        return;
      }

      const videos = response.data.items;

      for (const video of videos) {
        const videoData = video.snippet;
        const videoId = video.id.videoId;

        const learnData = new Learn({
          videoId: videoId,
          title: videoData.title,
          userId:userId
          // Add more fields as needed based on your schema
        });

        try {
          await learnData.save();
          learnDataArray.push(learnData);
        } catch (error) {
          console.error('Error saving to MongoDB:', error);
          res.status(500).json({ error: 'Error saving to MongoDB' });
          return;
        }
      }

      nextPageToken = response.data.nextPageToken;

      if (!nextPageToken) {
        // No more pages, exit the loop
        break;
      }

      console.log(`Fetched ${learnDataArray.length} videos.`);
      
      // Implement rate limiting logic here to avoid hitting the rate limit
      await sleep(1000); // Sleep for 1 second (adjust this interval as needed)
    }

    console.log('All videos fetched and saved successfully.');
    res.json({ videos: learnDataArray });

  } catch (error) {
    console.error('Error fetching or saving videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Function to sleep for a specified number of milliseconds
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}




// export const Videos = async (req, res) => {
    


//   try {
//     const userId = req.userId;
//     const API_KEY = 'AIzaSyC__44NzVKI2fNImwSu_d7T8ejLGGd5BPE';
//     const channelId = 'UCapzEjUWyv7H4GtPQrgybTQ';
//     let nextPageToken = 'CAUQAA';
//     const learnDataArray = [];

//     while (true) {
//       const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
//         params: {
//           part: 'snippet',
//           channelId,
//           maxResults:5,
//           type: 'video',
//           key: API_KEY,
//           pageToken: nextPageToken,
//         },
//       });

//       if (response.data.error) {
//         console.error('YouTube API Error:', response.data.error.message);
//         res.status(500).json({ error: 'YouTube API error' });
//         return;
//       }

//       const videos = response.data.items;

//       for (const video of videos) {
//         const videoData = video.snippet;
//         const videoId = video.id.videoId;
        
//         const learnData = new Learn({
//           videoId: videoId,
//           title: videoData.title,
//           userId:userId
//           // Add more fields as needed based on your schema
//         });

//         try {
//           await learnData.save();
//           learnDataArray.push(learnData);
//         } catch (error) {
//           console.error('Error saving to MongoDB:', error);
//           res.status(500).json({ error: 'Error saving to MongoDB' });
//           return;
//         }
//       }

//       nextPageToken = response.data.nextPageToken;

//       if (!nextPageToken) {
//         // No more pages, exit the loop
//         break;
//       }

//       console.log(`Fetched ${learnDataArray.length} videos.`);
      
//       // Implement rate limiting logic here to avoid hitting the rate limit
//       await sleep(1000); // Sleep for 1 second (adjust this interval as needed)
//     }

//     console.log('All videos fetched and saved successfully.');
//     res.json({ videos: learnDataArray });

//   } catch (error) {
//     console.error('Error fetching or saving videos:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // Function to sleep for a specified number of milliseconds
// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }


// export const Videos = async (req, res) => {
//   try {
//     const API_KEY = 'AIzaSyC__44NzVKI2fNImwSu_d7T8ejLGGd5BPE';
//     const channelId = 'UCapzEjUWyv7H4GtPQrgybTQ';
//     let nextPageToken = 'CAUQAA';

//     const learnDataArray = [];

//     do {
//       const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
//         params: {
//           part: 'snippet',
//           channelId,
//           maxResults: 50, // Maximum results per page
//           type: 'video',
//           key: API_KEY,
//           pageToken: nextPageToken, // Include the nextPageToken
//         },
//       });

//       const videos = response.data.items;

//       for (const video of videos) {
//         const videoData = video.snippet;
//         const videoId = video.id.videoId;

//         const learnData = new Learn({
//           videoId: videoId,
//           title: videoData.title,
//           // Add more fields as needed based on your schema
//         });

//         await learnData.save();

//         learnDataArray.push(learnData);
//       }

//       // Check if there's a next page
//       nextPageToken = response.data.nextPageToken;
//     } while (nextPageToken);

//     res.json({ videos: learnDataArray });
//   } catch (error) {
//     console.error('Error fetching channel information:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// get youtube videos
// export const Videos = async (req, res) => {
//   try {
//     const API_KEY = 'AIzaSyC__44NzVKI2fNImwSu_d7T8ejLGGd5BPE';
//           const channelId = 'UCapzEjUWyv7H4GtPQrgybTQ';
    
//     const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&maxResults=1045&type=video&key=${API_KEY}`);

  
      
      
//       const videos = response.data.items; // Assuming you want to save all videos

      

//       const learnDataArray = [];
  
//       // Iterate through each video and create a Learn document for each
//       for (const video of videos) {
//         const videoData = video.snippet;
//         const videoId = video.id.videoId; // Extract the videoId
  
//         const learnData = new Learn({
//           videoId: videoId, // Use the extracted videoId
//           title: videoData.title,
          
//           // Add more fields as needed based on your schema
//         });
  
//         await learnData.save();
  
//         learnDataArray.push(learnData);
//       }
//     // Iterate through each video and create a Learn document for each
   
//       // Send the channel ID as a response
//       res.json({ videos });
   
    
//   } catch (error) {
//     console.error('Error fetching channel information:', error);
//     // Handle errors and send an appropriate response
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };


       // Get All Learn //

// export const getallLearn = async (req, res) => {
   
//   const learn = await Learn.find();

//   res.status(200).json({
//     learn,
//   });
// };

export const getallLearn = async (req, res) => {
  try {
    const { page = 1, limit = 100 } = req.query; // Default to page 1, limit 10

    const skip = (page - 1) * limit;

    // Get total count of documents
    const totalItems = await Learn.countDocuments();

    // Fetch paginated data
    const learn = await Learn.find()
      .skip(skip)
      .limit(Number(limit))
      .populate('author', 'firstName lastName profilePicture')  // Dynamically fetch author details
      .exec();


    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      learn,
      totalItems,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching learn items:', error);
    res.status(500).json({ message: 'An error occurred while fetching the learn items.', error: error.message });
  }
};




// Create Learn //
export const createLearn = async (req, res) => {
  const { text } = req.body;
  const file = req.file;
  const userId = req.userId;

  if (!file || !file.originalname) {
    return res.status(400).json({ message: 'Invalid file data' });
  }

  try {
    // Upload image or video to Cloudinary
    const result = await cloudinary.uploader.upload(file.path, {
      folder: 'Learn',  // Store in Learn folder
      resource_type: 'auto',  // Let Cloudinary detect whether it's an image or video
    });

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const profile = await Profile.findOne({ userId });
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    // Create the Learn entry
    const learn = new Learn({
      text: text,
      file: result.secure_url,  // Store the file URL (image/video)
      userId: req.userId,
      author: profile._id  // Link to the author's profile
    });

    await learn.save();

    // Populate the author details after saving the learn entry
    const populatedLearn = await Learn.findById(learn._id)
      .populate('author', 'firstName lastName profilePicture')
      .exec();

    res.status(201).json({
      url: result.secure_url,
      learn: populatedLearn,
      message: "Successfully created",
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Update Learn //

export const updateLearn = async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  try {
    const learn = await Learn.findByIdAndUpdate(id, {text}, { new: true });

    if (!learn) {
      return res.status(404).json({ message: "issue not found" });
    }

    res.status(200).json({
      learn,
      message: "Successfully updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete Learn //

export const deleteCommentLearn = async (req, res) => {
  try {
    const { learnId, commentId } = req.params;

    // Find the article and remove the comment from the comments array
    const learn = await Learn.findByIdAndUpdate(
      learnId,
      { $pull: { comments: { _id: commentId } } },
      { new: true }
    );

    res.status(200).json({ message: 'Comment deleted successfully.', learn });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: 'An error occurred while deleting the comment.' });
  }
};




export const updateCommentLearn = async (req, res) => {
  try {
    const { learnId, commentId } = req.params;
    const { newText } = req.body;

    // Find the article and the comment to edit
    const learn = await Learn.findById(learnId);
    if (!learn) {
      return res.status(404).json({ message: "learn not found" });
    }

    const comment = learn.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Update the comment text
    comment.text = newText;

    // Save the updated article
    const updatedLearn = await learn.save();

    res.status(200).json({ message: "Comment edited successfully", updatedLearn });
  } catch (error) {
    console.error('Error editing comment:', error);
    res.status(500).json({ message: 'An error occurred while editing the comment' });
  }
};




export const likeCommentLearn = async (req,res)=>{


  try {
    const { learnId, commentId } = req.params;
    const userId = req.userId; // Assuming user ID is available from the authenticated request

    // Fetch the article
    const learn = await Learn.findById(learnId);
    if (!learn) {
      return res.status(404).json({ message: 'learn not found' });
    }

    // Fetch the comment
    const comment = learn.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Fetch the user profile details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userProfile = {
      userId: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
    };


// Create a new notification
if (comment.userId.toString() !== userId) {
  // Create notification only if the article is not liked by its owner
  const notification = new Notification({
    user: comment.userId,
    type: 'like',
    learn: learn._id,
    message: `${user.firstName} ${user.lastName} liked your comment.`,
  });

  await notification.save();

  pusher.trigger('learn-channel', 'like-learn-comment', {
    learnId,
    userId,
    message: `${user.firstName} ${user.lastName} liked yoursSSSSsss comment.`,
  });

  // Emit socket event to the article owner
  // io.to(learn.userId.toString()).emit('notification', notification,{ learnId, userId });
}





    // Check if user already liked the comment
    const likedIndex = comment.likedBy.findIndex(
      (likedUser) => likedUser.userId.toString() === userId
    );

    if (likedIndex === -1) {
      // If user hasn't liked the comment yet, like it
      comment.likedBy.push(userProfile);
      comment.likes += 1;
    } else {
      // If user has already liked the comment, unlike it
      comment.likedBy.splice(likedIndex, 1);
      comment.likes -= 1;
    }

    await learn.save();

    res.json({
      learnId,
      commentId,
      likes: comment.likes,
      likedBy: comment.likedBy,
    });
  } catch (error) {
    console.error(error); // Add logging for debugging
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }


}


export const deleteLearn = async (req, res) => {
  const id = req.params.id;
  const learn = await Learn.findByIdAndRemove(id);
  res.status(202).json({
    learn,
    message: "succsessfully deleted",
  });
};




// export const getLibary = async (req, res) => {
//   const libary = await Libary.find();

//   res.status(200).json({
//     libary,
//   });
// };

export const getLibary = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    const skip = (page - 1) * limit;

    // Get total count of documents
    const totalItems = await Libary.countDocuments();

    // Fetch paginated data
    const libary = await Libary.find()
      .skip(skip)
      .limit(Number(limit));

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      libary,
      totalItems,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching library:', error);
    res.status(500).json({ message: 'An error occurred while fetching the library.', error: error.message });
  }
};






 // Save Result for libary product //

 export const saveResult = async (req,res)=>{

  const searchTerm = req.query.term; // Get the search term from the query parameter

  try {
    // Send request to the external API
    const response = await axios.get('https://www.bimobject.com/proxy/search-api-2/v1/products', {
      params: {
        term: searchTerm,
      },
    });

    console.log(response,'response')

    const saveResults = response.data; // Assuming the API response contains an array of search results

    // Save search results in MongoDB
    for (const result of saveResults.data) {
      const newsaveResult = new Libary({
        productName: result.name,
        imageUrl: result.imageUrl,
        // Add more fields as needed
      });
      await newsaveResult.save();
    }

    res.json(saveResults); // Send the search results back to the client
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }


}
  


export const getAllapi = async(req,res)=>{
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

    const skip = (page - 1) * limit;

    // Get total count of documents
    const totalItems = await JobApi.countDocuments();

    // Fetch paginated data
    const jobapi = await JobApi.find()
      .skip(skip)
      .limit(Number(limit));

    const totalPages = Math.ceil(totalItems / limit);

    res.status(200).json({
      jobapi,
      totalItems,
      totalPages,
      currentPage: Number(page),
    });
  } catch (error) {
    console.error('Error fetching articles:', error);
    res.status(500).json({ message: 'An error occurred while fetching the articles.', error: error.message });
  }

}



export const fetchAndSaveJobs = async (req, res) => {
  const searchTerm = req.query.term;
  const location = req.query.location;

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: searchTerm,
        location: location,
        page: '1',
        num_pages: '1',
      },
      headers: {
        'X-RapidAPI-Key': 'e98e90d379mshe0700d7a1db3f40p17f022jsn8da99719078c',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },

    });

    const jobs = response.data.data.map(job => ({
      job_id: job.id,
      job_title: job.job_title,
      employer_name: job.employer_name,
      employer_logo: job.employer_logo,
      job_city: job.job_city,
      job_country: job.job_country,
      job_posted_at_datetime_utc: job.job_posted_at_datetime_utc,
      job_max_salary: job.job_max_salary,
      job_publisher: job.job_publisher,
      job_employment_type: job.job_employment_type,
      job_description: job.job_description,
      job_apply_link: job.job_apply_link,
    }));

    await JobApi.insertMany(jobs);

    res.status(200).json({ message: 'Jobs fetched and saved successfully',jobs});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching and saving jobs', error });
  }
};

export const getAllApiJobs = async (req, res) => {
  try {
    const jobs = await Job.find();
    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching jobs', error });
  }
};



export const searchJobsInDB = async (req, res) => {
  const { term, location , country } = req.query;

  try {
    const query = {
      job_title: { $regex: term, $options: 'i' },
      // job_country: { $regex: country, $options: 'i' },
    };

    if (location) {
      query.job_city = { $regex: location, $options: 'i' };
    }

    
    if (country) {
      query.job_country = { $regex: country, $options: 'i' };
    }

    console.log('Query:', JSON.stringify(query, null, 2)); // Log the query for debugging

    const jobs = await JobApi.find(query);

    console.log('Jobs found:', jobs.length); // Log the number of jobs found

    res.status(200).json(jobs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error searching jobs', error });
  }
};


// export const searchJobsInDB = async (req, res) => {
//   const { term, location } = req.query;

//   try {
//     const query = {
//       job_title: { $regex: term, $options: 'i' },
//     };

//     if (location) {
//       query.job_city = { $regex: location, $options: 'i' };
//     }

//     const jobs = await Job.find(query);
//     res.status(200).json(jobs);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Error searching jobs', error });
//   }
// };


export const getRapidjobs  = async(req,res)=>{

  const searchTerm = req.query.term;
  const location = req.query.location; 


  const response = await axios.get(`https://jsearch.p.rapidapi.com/search`, {
    params: {
      query: searchTerm,
      location: location,
          page: '20',
          num_pages: '20'
     
    },

    headers: {
      'X-RapidAPI-Key': '622e902bd8msh1139c0b10a4db77p1b98c8jsn7ff60b995272',
      'X-RapidAPI-Host': 'jsearch.p.rapidapi.com'
    }
  


  });

  const saveResults = response.data
  
  try {
    res.json(saveResults);
  } catch (error) {
    console.error(error);
  }


  
}







export const getJobSuggestions = async (req, res) => {
  const searchTerm = req.query.term;

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: searchTerm,
        page: '1',
        num_pages: '1', // Only fetch the first page
      },
      headers: {
        'X-RapidAPI-Key': '622e902bd8msh1139c0b10a4db77p1b98c8jsn7ff60b995272',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    const jobTitles = response.data.data.map(job => job.job_title);
    res.json(jobTitles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching job suggestions', error });
  }
};



export const getLocationSuggestions = async (req, res) => {
  const searchTerm = req.query.term;

  try {
    const response = await axios.get('https://jsearch.p.rapidapi.com/search', {
      params: {
        query: searchTerm,
        page: '1',
        num_pages: '1', // Only fetch the first page
      },
      headers: {
        'X-RapidAPI-Key': '622e902bd8msh1139c0b10a4db77p1b98c8jsn7ff60b995272',
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
      },
    });

    const locations = response.data.data.map(job => job.job_city);
    const uniqueLocations = [...new Set(locations)]; // Remove duplicates
    res.json(uniqueLocations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching location suggestions', error });
  }
};

// const axios = require('axios');

// const API_KEY = 'YOUR_API_KEY'; // Replace with your actual API key
// const BASE_URL = 'https://api.autodesk.com/revit/forum'; // Replace with the API base URL

// async function searchRevitForum(query) {
//   try {
//     const response = await axios.get(`${BASE_URL}/search`, {
//       headers: {
//         Authorization: `Bearer ${API_KEY}`,
//       },
//       params: {
//         q: query,
//       },
//     });

//     const results = response.data.results;
//     // Process and display the results in your user interface
//     console.log(results);
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }

// // Example usage
// const userQuery = 'issue to search'; // Replace with the user's search query
// searchRevitForum(userQuery);





//     // Create Srtipe Payment Method Customer //

// export const createCustomer = async (req, res) => {
//   try {
//     const customer = await stripeClient.customers.create({
//       name: req.body.name,
//       email: req.body.email,
//     });

//     res.status(200).send(customer);
//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// };

      

//    // Add New Card For Stripe Payment //

// export const addNewCard = async (req, res) => {
//   try {
//     const {
//       customer_id,
//       card_Name,
//       card_ExpYear,
//       card_ExpMonth,
//       card_Number,
//       card_CVC,
//     } = req.body;

//     const card_token = await stripeClient.tokens.create({
//       card: {
//         name: card_Name,
//         number: card_Number,
//         exp_year: card_ExpYear,
//         exp_month: card_ExpMonth,
//         cvc: card_CVC,
//       },
//     });

//     const card = await stripeClient.customers.createSource(customer_id, {
//       source: `${card_token.id}`,
//     });

//     res.status(200).send({ card: card.id });
//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// };

       
//       // Create Charge For Card Payment //
    
// export const createCharges = async (req, res) => {
//   try {
//     const createCharge = await stripeClient.charges.create({
//       receipt_email: "tester@gmail.com",
//       amount: parseInt(req.body.amount) * 100, //amount*100
//       currency: "USD",
//       card: req.body.card_id,
//       customer: req.body.customer_id,
//     });

//     res.status(200).send(createCharge);
//   } catch (error) {
//     res.status(400).send({ success: false, msg: error.message });
//   }
// };






// Create Srtipe Payment With Product //

// export const payforProduct = async(req,res)=>{

// console.log(req.body);
//   const {productName , price, quantity} = req.body;
//   const productId = req.params.id;
//   // const {source} = req.body;
//   // const {paymentMethodId} = req.body;

// const product = await Product.findById(productId);

// if(!product){
// return res.status(404).json({error:"not found"});

// }
// const paymentIntent = await stripeClient.customers.create({

//   amount:product.price*product.quantity,
//   currency:['usd'],
//   payment_method_types:['card'],
//   payment_method:paymentMethodId,
//   confirm:true,
//   description:product.productName,
//   source: req.body.stripeToken,

//   metadata:{
//    userId:product.userId.toString(),
//    productId:product._id.toString()

//   }
// });
// await paymentIntent.save();

// res.status(202).json({
//   paymentIntent,
//   message:"payment succsessfully created"
// })

// }
