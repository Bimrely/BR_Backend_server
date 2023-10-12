import { Article } from "../Models/article.js";
import { Job } from "../Models/job.js";
import { Issue } from "../Models/issue.js";
import { Learn } from "../Models/learn.js";
import {Like} from "../Models/like.js"
import { Share } from "../Models/share.js";
import {Comment} from "../Models/comment.js"
import { Libary } from "../Models/libary.js";
import {emitLikeNotification,emitCommentNotification} from "../Socket/socket.js"
import axios from "axios";





// Like an article
export const likeArticle = async (req, res) => {
  try {
    const { articleId , userId} = req.params;
    // const { userId } = req.body;

    // Check if the user has already liked the article
    const existingLike = await Like.findOne({ user: userId, article: articleId });
    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this article.' });
    }

    // Create a new like
    const like = new Like({ user: userId, article: articleId });
    await like.save();

    // Update the article's like count
    await Article.findByIdAndUpdate(articleId, { $inc: { likes: 1 } });

    emitLikeNotification(articleId,like);

    res.status(200).json({ message: 'Article liked successfully.' });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ message: 'An error occurred while liking the article.' });
  }
};



// Comment on an article
export const commentArticle = async (req, res) => {
  try {
    const { articleId } = req.params;
    const {userId} = req.params;
    console.log(articleId);
    console.log(userId); 

    const { text} = req.body;
  
   
    // Create a new comment
    const comment = new Comment({ userId:userId, article: articleId, text });
    await comment.save();
    emitCommentNotification(articleId);
    const article = await Article.findByIdAndUpdate(articleId, {
      
        $push: { comments:{
            _id: comment._id, 
            text: comment.text,
           userId:comment.userId
        } 
                 
             },
          
    });
await article.save();
    res.status(200).json({ message: 'Comment added successfully.',article});
  } catch (error) {
    console.error('Error commenting on article:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the article.' });
  }
};


// Share an article
export const shareArticle = async (req, res) => {
  try {
    const { articleId , userId} = req.params;

     // Create a new like
     const share = new Share({ user: userId, article: articleId });
     await share.save();
    
    
    
    // Update the article's share count
    await Article.findByIdAndUpdate(articleId, { $inc: { shares: 1 } });



    res.status(200).json({ message: 'Article shared successfully.' });
  } catch (error) {
    console.error('Error sharing article:', error);
    res.status(500).json({ message: 'An error occurred while sharing the article.' });
  }
};














// Like an Issue
export const likeIssue = async (req, res) => {
  try {
    const { issueId ,userId } = req.params;
    // const { userId } = req.body;

    // Check if the user has already liked the article
    const existingLike = await Like.findOne({ user: userId, issue: issueId });
    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this issue.' });
    }

    // Create a new like
    const like = new Like({ user: userId, issue: issueId });
    await like.save();

    // Update the article's like count
    await Issue.findByIdAndUpdate(issueId, { $inc: { likes: 1 } });

    res.status(200).json({ message: 'Issue liked successfully.' });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ message: 'An error occurred while liking the issue.' });
  }
};



// Comment on an  Issue
export const commentIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    const { userId } = req.params;
    const {  text, comments} = req.body;

    // Create a new comment
    const comment = new Comment({ userId: userId, issue: issueId, text });
    await comment.save();
    
    const issue = await Issue.findByIdAndUpdate(issueId, {
      
      $push: { comments:{
          _id: comment._id, 
          text: comment.text,
         userId:comment.userId
      } 
               
           },
        
  });
  // await issue.save()
    // await Issue.findByIdAndUpdate(issueId,comments);

    res.status(200).json({ message: 'Comment added successfully.' });
  } catch (error) {
    console.error('Error commenting on issueId:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the issue.' });
  }
};




// Share an Issue
export const shareIssue = async (req, res) => {
  try {
    const { issueId , userId} = req.params;

    const share = new Share({user:userId, issue:issueId})
    await share.save();

    // Update the article's share count
    await Issue.findByIdAndUpdate(issueId, { $inc: { shares: 1 } });

    res.status(200).json({ message: 'Issue shared successfully.' });
  } catch (error) {
    console.error('Error sharing Issue:', error);
    res.status(500).json({ message: 'An error occurred while sharing the Issue.' });
  }
};





// Like an Learn
export const likeLearn = async (req, res) => {
  try {
    const { learnId , userId} = req.params;
    

    // Check if the user has already liked the article
    const existingLike = await Like.findOne({ user: userId, learn: learnId });
    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this learn.' });
    }

    // Create a new like
    const like = new Like({ user: userId, learn: learnId });
    await like.save();

    // Update the article's like count
    await Learn.findByIdAndUpdate(learnId , { $inc: { likes: 1 } });

    res.status(200).json({ message: 'Learn liked successfully.' });
  } catch (error) {
    console.error('Error liking article:', error);
    res.status(500).json({ message: 'An error occurred while liking the issue.' });
  }
};



// Comment on an  Learn
export const commentLearn = async (req, res) => {
  try {
    const { learnId } = req.params;
    const { userId } = req.params;
    const {  text, comments} = req.body;

    // Create a new comment
    const comment = new Comment({ userId: userId, learn: learnId, text });
    await comment.save();
    
    const learn = await Learn.findByIdAndUpdate(learnId, {
      
      $push: { comments:{
          _id: comment._id, 
          text: comment.text,
         userId:comment.userId
      } 
               
           },
        
  });
  // await issue.save()
    // await Issue.findByIdAndUpdate(issueId,comments);

    res.status(200).json({ message: 'Comment added successfully.' });
  } catch (error) {
    console.error('Error commenting on issueId:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the issue.' });
  }
};




// Share an Learn
export const shareLearn = async (req, res) => {
  try {
    const { learnId , userId } = req.params;


      const share = new Share({user:userId,learn:learnId});
      await share.save();

    // Update the article's share count
    await Learn.findByIdAndUpdate(learnId, { $inc: { shares: 1 } });

    res.status(200).json({ message: 'Learn shared successfully.' });
  } catch (error) {
    console.error('Error sharing Issue:', error);
    res.status(500).json({ message: 'An error occurred while sharing the Issue.' });
  }
};










// Like an Job
export const likeJob = async (req, res) => {
  try {
    const { jobId , userId} = req.params;
    

    // Check if the user has already liked the Job
    const existingLike = await Like.findOne({ user: userId, job: jobId });
    if (existingLike) {
      return res.status(400).json({ message: 'You have already liked this job.' });
    }

    // Create a new like
    const like = new Like({ user: userId, job:jobId });
    await like.save();

    // Update the article's like count
    await Job.findByIdAndUpdate(jobId , { $inc: { likes: 1 } });

    res.status(200).json({ message: 'job liked successfully.' });
  } catch (error) {
    console.error('Error liking job:', error);
    res.status(500).json({ message: 'An error occurred while liking the issue.' });
  }
};



// Comment on an  Job
export const commentJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId } = req.params;
    const { text} = req.body;

    // Create a new comment
    const comment = new Comment({ userId: userId, job:jobId, text });
    await comment.save();
    
    const job = await Job.findByIdAndUpdate(jobId, {
      
      $push: { comments:{
          _id: comment._id, 
          text: comment.text,
         userId:comment.userId
      } 
               
           },
        
  });
 
    res.status(200).json({ message: 'Comment added successfully.' });
  } catch (error) {
    console.error('Error commenting on jobId:', error);
    res.status(500).json({ message: 'An error occurred while commenting on the issue.' });
  }
};




// Share an Job
export const shareJob = async (req, res) => {
  try {
    const { jobId , userId } = req.params;


      const share = new Share({user:userId,job:jobId});
      await share.save();

    // Update the article's share count
    await Job.findByIdAndUpdate(jobId, { $inc: { shares: 1 } });

    res.status(200).json({ message: 'Job shared successfully.' });
  } catch (error) {
    console.error('Error sharing Issue:', error);
    res.status(500).json({ message: 'An error occurred while sharing the Issue.' });
  }
};
















// Get All Articles//
export const getallArticle = async (req, res) => {
  const article = await Article.find();

  res.status(200).json({
    article,
  });
};

// Create Article //
export const createArticle = async (req, res) => {
  const { name } = req.body;
  const { file } = req;
  // const {userId} = req.params;
  
  const att = {
    name: file.originalname,
    fileInfo: file,
    fileBucket: file.bucket,
    fileKey: file.key,
    location: file.location,
    contentType: file.mimetype,
};
  
  
  const article = new Article({
    name:name,
    file:att,
    userId: req.userId,
  });

  await article.save();

  res.status(201).json({
    article,
    message: "succsessfully created",
  });
};

// Update Article //

export const updateArticle = async (req, res) => {
  const {id} = req.params;
  const { name } = req.body;

  // const article = {
  //   name,

  // };

 const article = await Article.findByIdAndUpdate(id, {name}, { new: true });

 await article.save();

  res.status(200).json({
    article,
    message: "succsessfully updated",
  });
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
export const getallJob = async (req, res) => {
  const job = await Job.find();

  res.status(200).json({
    job,
  });
};

// Create Job //
export const createJob = async (req, res) => {
  const { name } = req.body;
  const { file } = req;
  
  const att = {
    name: file.originalname,
    fileInfo: file,
    fileBucket: file.bucket,
    fileKey: file.key,
    location: file.location,
    contentType: file.mimetype,
};
  
  
  const job = new Job({
    name:name,
    file:att,
    userId: req.userId,
  });

  await job.save();

  res.status(201).json({
    job,
    message: "succsessfully created",
  });
};

// Update Job //

export const updateJob = async (req, res) => {
  const {id} = req.params;
  const { name } = req.body;



 const job = await Job.findByIdAndUpdate(id, {name}, { new: true });

 await job.save();

  res.status(200).json({
    job,
    message: "succsessfully updated",
  });
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
export const getallIssue = async (req, res) => {
  const issue = await Issue.find();

  res.status(200).json({
  issue,
  });
};

// Create Issue //
export const createIssue = async (req, res) => {
  const { name } = req.body;
  const { file } = req;
  
  const att = {
    name: file.originalname,
    fileInfo: file,
    fileBucket: file.bucket,
    fileKey: file.key,
    location: file.location,
    contentType: file.mimetyIssues};
  
  
  const issue= new Issue({
    name:name,
    file:att,
    userId: req.userId });
  
  await issue.save();

  res.status(201).json({
  issue,
    message: "succsessfully created",
  });
};

// Update Issue//

export const updateIssue = async (req, res) => {
  const {id} = req.params;
  const { name } = req.body;


 const issue = await Issue.findByIdAndUpdate(id, {name}, { new: true });

 await issue.save();

  res.status(200).json({
    issue,
    message: "succsessfully updated",
  });
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





export const Videos = async (req, res) => {
  try {
    const API_KEY = 'AIzaSyC__44NzVKI2fNImwSu_d7T8ejLGGd5BPE';
    const channelId = 'UCapzEjUWyv7H4GtPQrgybTQ';
    let nextPageToken = 'CAUQAA';
    const learnDataArray = [];

    while (true) {
      const response = await axios.get(`https://youtube.googleapis.com/youtube/v3/search`, {
        params: {
          part: 'snippet',
          channelId,
          maxResults: 50,
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

export const getallLearn = async (req, res) => {
   
  const learn = await Learn.find();

  res.status(200).json({
    learn,
  });
};

// Create Learn //
export const createLearn = async (req, res) => {
  const { name } = req.body;
  const { file } = req;
  
  const att = {
    name: file.originalname,
    fileInfo: file,
    fileBucket: file.bucket,
    fileKey: file.key,
    location: file.location,
    contentType: file.mimetyIssues};
  
  
  const learn= new Learn({
    name:name,
    file:att,
    userId: req.userId });
  
  await learn.save();

  res.status(201).json({
  learn,
    message: "succsessfully created",
  });
};

// Update Learn //

export const updateLearn = async (req, res) => {
  const {id} = req.params;
  const { name } = req.body;


 const learn = await Learn.findByIdAndUpdate(id, {name}, { new: true });

 await learn.save();

  res.status(200).json({
    learn,
    message: "succsessfully updated",
  });
};

// Delete Learn //

export const deleteLearn = async (req, res) => {
  const id = req.params.id;
  const learn = await Learn.findByIdAndRemove(id);
  res.status(202).json({
    learn,
    message: "succsessfully deleted",
  });
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
  
export const getRapidjobs  = async(req,res)=>{

  const searchTerm = req.query.term;



  const response = await axios.get(`https://jsearch.p.rapidapi.com/search`, {
    params: {
      query: searchTerm,
          page: '1',
          num_pages: '20'
     
    },

    headers: {
      'X-RapidAPI-Key': 'e98e90d379mshe0700d7a1db3f40p17f022jsn8da99719078c',
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
