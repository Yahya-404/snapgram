import { ID, Query } from "appwrite";

import { INewPost, INewUser, IUpdatePost, IUpdateUser } from "@/types";
import { account, AppWriteConfig, avatars, databases, storage } from "./config";

// ============================================================
// AUTH
// ============================================================

/**
 * Signs up a new account and saves user information to the database.
 * Handles errors by logging them and returning the error.
 * @param {INewUser} user - The user information for signing up.
 * @returns {Promise<any>} The newly created user document from the database.
 * @throws Will throw an error if the account creation or saving to the database fails.
 */
export async function signUpAccount(user: INewUser) {
  try {
    // Create a new account with the provided user details
    const newAccount = await account.create(
      ID.unique(),
      user.email,
      user.password,
      user.name
    );
    if (!newAccount) throw new Error("New Account missing create");

    // Generate an avatar URL based on the user's name
    const avatarUrl = avatars.getInitials(user.name);

    // Save the user details to the database
    const newUser = await saveUserToDB({
      accountId: newAccount.$id,
      email: newAccount.email,
      name: newAccount.name,
      username: user.username,
      imageUrl: avatarUrl,
    });

    return newUser;
  } catch (error) {
    console.log(error);
    return error;
  }
}

/**
 * Saves user information to the database.
 * Handles errors by logging them.
 * @param {object} user - The user information to save.
 * @param {string} user.accountId - The ID of the user's account.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.name - The name of the user.
 * @param {string} [user.username] - The username of the user (optional).
 * @param {URL} user.imageUrl - The URL of the user's avatar.
 * @returns {Promise<any>} The newly created user document from the database.
 * @throws Will throw an error if saving to the database fails.
 */
export async function saveUserToDB(user: {
  accountId: string;
  email: string;
  name: string;
  username?: string;
  imageUrl: URL;
}) {
  try {
    // Create a new user document in the database
    const newUser = databases.createDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.usersCollectionId,
      ID.unique(),
      user
    );

    return newUser;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Signs in a user and creates a session.
 * Handles errors by logging them.
 * @param {object} user - The user credentials for signing in.
 * @param {string} user.email - The email address of the user.
 * @param {string} user.password - The password of the user.
 * @returns {Promise<any>} The session token if sign-in is successful.
 * @throws Will throw an error if signing in or creating a session fails.
 */
export async function signInAccount(user: { email: string; password: string }) {
  try {
    // Create a session for the user with the provided credentials
    // createEmailPasswordSession Function returning a token
    const session = await account.createEmailPasswordSession(
      user.email,
      user.password
    );

    return session;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves the current account from the authentication service.
 * Handles errors by logging them and throwing an informative error message.
 * @returns {Promise<Account | undefined>} The current account, or undefined if not found.
 * @throws Will throw an error if the current account cannot be retrieved.
 */
export async function getAccount() {
  try {
    // Fetch the current account from the authentication service
    // account.get(): It uses the Token Stored in memory or Cookies to fetch Account Information like ID, Name, Email, etc...
    const currentAccount = await account.get();
    // if (!currentAccount)
    //   throw new Error("Failed to retrieve the current account");

    return currentAccount;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves the current user from the database.
 * Handles errors by logging them and throwing an informative error message.
 * @returns {Promise<any | null>} The current user document from the database, or null if not found.
 * @throws Will throw an error if the current user cannot be retrieved.
 */
export async function getCurrentUser() {
  try {
    // Retrieve the current account
    const currentAccount = await getAccount();
    if (!currentAccount)
      throw new Error("Failed to retrieve the current account");

    // Fetch the current user from the database
    const currentUser = databases.listDocuments(
      AppWriteConfig.databasesId,
      AppWriteConfig.usersCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );
    if (!currentUser) throw new Error("No user found");

    return (await currentUser).documents[0];
  } catch (error) {
    console.log(error);
    return null;
  }
}

/**
 * Signs out the current user by deleting their session.
 * Handles errors by logging them and throwing an informative error message.
 * @returns {Promise<any>} The result of the session deletion.
 * @throws Will throw an error if signing out or deleting the session fails.
 */
export async function signOutAccount() {
  try {
    // Delete the current session
    const session = account.deleteSession("current");
    return session;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// POSTS
// ============================================================

/**
 * Creates a new post by uploading a file and storing post details in the database.
 * Handles errors by logging them and throwing informative error messages.
 * @param {INewPost} post - The post details including file, user ID, caption, location, and tags.
 * @returns {Promise<any>} The newly created post document from the database.
 * @throws Will throw an error if any of the following fails:
 * - "Failed to upload file": If file upload to storage fails.
 * - "Failed to retrieve file URL": If retrieving the file preview URL fails.
 * - "Failed to create post": If creating a new post in the database fails.
 */
export async function createPost(post: INewPost) {
  try {
    // Upload file to AppWrite storage
    const uploadedFile = await uploadFile(post.file[0]);
    if (!uploadedFile) throw Error;

    // Get file URL for preview
    const fileUrl = await getFilePreview(uploadedFile.$id);
    if (!fileUrl) {
      await deleteFile(uploadedFile.$id); // Cleanup if URL retrieval fails
      throw new Error("Failed to retrieve file URL");
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    // Create new post in the database
    const newPost = await databases.createDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      ID.unique(),
      {
        creator: post.userId,
        caption: post.caption,
        imageUrl: fileUrl,
        imageId: uploadedFile.$id,
        location: post.location,
        tags: tags,
      }
    );

    if (!newPost) {
      await deleteFile(uploadedFile.$id); // Cleanup if post creation fails
      throw new Error("Failed to create post");
    }

    return newPost;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Uploads a file to the server.
 * Handles errors by logging them and throwing an informative error message.
 * @param {File} file - The file to be uploaded.
 * @returns {Promise<FileDocument>} The uploaded file document.
 * @throws Will throw an error if the file upload fails.
 */
export async function uploadFile(file: File) {
  try {
    const fileDocument = await storage.createFile(
      AppWriteConfig.storageId,
      ID.unique(),
      file
    );
    // if (!fileDocument) throw new Error("Failed to upload the file");

    return fileDocument;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Retrieves a preview URL of the uploaded file.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} fileId - The ID of the file.
 * @returns {Promise<string | undefined>} The URL of the file preview, or undefined if not found.
 * @throws Will throw an error if the file preview cannot be retrieved.
 */
export async function getFilePreview(fileId: string) {
  try {
    // Fetch the file preview URL from the server
    const fileUrl = storage.getFilePreview(
      AppWriteConfig.storageId,
      fileId,
      // width 2000px
      2000,
      // height 2000px
      2000
      // View From The Top
      // 'top',
      // Quality
      // 100
    );
    if (!fileUrl) throw new Error("Failed to get file preview");

    return fileUrl;
  } catch (error) {
    console.log(error);
  }
}

/**
 * Deletes a file from the server.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} fileId - The ID of the file to be deleted.
 * @returns {Promise<void>} A promise indicating the deletion result.
 * @throws Will throw an error if the file deletion fails.
 */
export async function deleteFile(fileId: string) {
  try {
    await storage.deleteFile(AppWriteConfig.storageId, fileId);
    return { status: "ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS BY SEARCH
/**
 * Searches for posts in the database based on the search term provided.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} searchTerm - The term to search for in post captions.
 * @returns {Promise<any>} The list of posts matching the search term.
 * @throws Will throw an error if:
 *   - "Failed to search posts": If querying the posts database fails.
 */
export async function searchPosts(searchTerm: string) {
  try {
    const posts = await databases.listDocuments(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      [Query.search("caption", searchTerm)]
    );

    if (!posts) throw new Error("Failed to search posts");

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET INFINITE POSTS
/**
 * Retrieves posts in a paginated manner with infinite scrolling support.
 * Handles errors by logging them and throwing an informative error message.
 * @param {Object} params - The parameters for pagination.
 * @param {number} params.pageParam - The cursor for pagination.
 * @returns {Promise<any>} The list of posts for the requested page.
 * @throws Will throw an error if:
 *   - "Failed to retrieve posts": If querying the posts database fails.
 */
export async function getInfinitePosts({ pageParam }: { pageParam: number }) {
  const queries: any[] = [Query.orderDesc("$updatedAt"), Query.limit(9)];

  if (pageParam) {
    queries.push(Query.cursorAfter(pageParam.toString()));
  }

  try {
    const posts = await databases.listDocuments(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      queries
    );

    if (!posts) throw new Error("Failed to retrieve posts");

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POSTS BY ID
/**
 * Retrieves a specific post by its ID.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} [postId] - The ID of the post to retrieve.
 * @returns {Promise<any>} The post document.
 * @throws Will throw an error if:
 *   - "Invalid post ID": If no post ID is provided.
 *   - "Failed to retrieve post": If querying the post by ID fails.
 */
export async function getPostById(postId?: string) {
  if (!postId) throw new Error("Invalid post ID");

  try {
    const post = await databases.getDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      postId
    );

    if (!post) throw new Error("Failed to retrieve post");

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE POST
/**
 * Updates an existing post with new details and optional file.
 * Handles errors by logging them and throwing informative error messages.
 * @param {IUpdatePost} post - The updated post details including optional file.
 * @returns {Promise<any>} The updated post document.
 * @throws Will throw an error if:
 *   - "Failed to upload file": If uploading a new file fails.
 *   - "Failed to get file preview": If retrieving the new file URL fails.
 *   - "Failed to update post": If updating the post in the database fails.
 */
export async function updatePost(post: IUpdatePost) {
  const hasFileToUpdate = post.file.length > 0;

  try {
    let image = {
      imageUrl: post.imageUrl,
      imageId: post.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to AppWrite storage
      const uploadedFile = await uploadFile(post.file[0]);
      if (!uploadedFile) throw new Error("Failed to upload file");

      // Get new file url
      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to get file preview");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    // Convert tags into array
    const tags = post.tags?.replace(/ /g, "").split(",") || [];

    //  Update post
    const updatedPost = await databases.updateDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      post.postId,
      {
        caption: post.caption,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
        location: post.location,
        tags: tags,
      }
    );

    if (!updatedPost) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }

      throw new Error("Failed to update post");
    }

    // Safely delete old file after successful update
    if (hasFileToUpdate) {
      await deleteFile(post.imageId);
    }

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE POST From Databases & Storage
/**
 * Deletes a post from the database and its associated file from storage.
 * Handles errors by logging them and throwing informative error messages.
 * @param {string} [postId] - The ID of the post to delete.
 * @param {string} [imageId] - The ID of the image associated with the post.
 * @returns {Promise<Object>} Status object indicating success.
 * @throws Will throw an error if:
 *   - "Invalid post or image ID": If either post ID or image ID is missing.
 *   - "Failed to delete post": If deleting the post from the database fails.
 *   - "Failed to delete file": If deleting the file from storage fails.
 */
export async function deletePost(postId?: string, imageId?: string) {
  if (!postId || !imageId) return;
  try {
    // Delete From Databases
    const statusCode = await databases.deleteDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      postId
    );

    if (!statusCode) throw new Error("Failed to delete post");

    // Delete From Storage
    await deleteFile(imageId);
    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== LIKE / UNLIKE POST
/**
 * Updates the like count of a post.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} postId - The ID of the post to update.
 * @param {string[]} likesArray - The updated array of likes.
 * @returns {Promise<any>} The updated post document.
 * @throws Will throw an error if:
 *   - "Failed to update likes": If updating the like count in the database fails.
 */
export async function likePost(postId: string, likesArray: string[]) {
  try {
    const updatedPost = await databases.updateDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      postId,
      {
        likes: likesArray,
      }
    );

    if (!updatedPost) throw new Error("Failed to update likes");

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== SAVE POST
/**
 * Saves a post for a user, indicating that the user has bookmarked it.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} userId - The ID of the user saving the post.
 * @param {string} postId - The ID of the post to save.
 * @returns {Promise<any>} The updated post document.
 * @throws Will throw an error if:
 *   - "Failed to save post": If saving the post fails.
 */
export async function savePost(userId: string, postId: string) {
  try {
    const updatedPost = await databases.createDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.savesCollectionId,
      ID.unique(),
      {
        user: userId,
        post: postId,
      }
    );

    if (!updatedPost) throw new Error("Failed to save post");

    return updatedPost;
  } catch (error) {
    console.log(error);
  }
}

// ============================== DELETE SAVED POST
/**
 * Deletes a saved post record from the database.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} savedRecordId - The ID of the saved post record to delete.
 * @returns {Promise<Object>} Status object indicating success.
 * @throws Will throw an error if:
 *   - "Failed to delete saved post": If deleting the saved post record fails.
 */
export async function deleteSavedPost(savedRecordId: string) {
  try {
    const statusCode = await databases.deleteDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.savesCollectionId,
      savedRecordId
    );

    if (!statusCode) throw new Error("Failed to delete saved post");

    return { status: "Ok" };
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER'S POST
/**
 * Retrieves posts created by a specific user.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} [userId] - The ID of the user whose posts are to be retrieved.
 * @returns {Promise<any>} The list of posts created by the user.
 * @throws Will throw an error if:
 *   - "Invalid user ID": If no user ID is provided.
 *   - "Failed to retrieve user's posts": If querying the user's posts fails.
 */
export async function getUserPosts(userId?: string) {
  if (!userId) return;

  try {
    const post = await databases.listDocuments(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      [Query.equal("creator", userId), Query.orderDesc("$createdAt")]
    );

    if (!post) throw new Error("Failed to retrieve user's posts");

    return post;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET POPULAR POSTS (BY HIGHEST LIKE COUNT)
/**
 * Retrieves the most recent posts based on creation date.
 * Handles errors by logging them and throwing an informative error message.
 * @returns {Promise<any>} The list of the most recent posts.
 * @throws Will throw an error if:
 *   - "Failed to retrieve recent posts": If querying the recent posts fails.
 */
export async function getRecentPosts() {
  try {
    const posts = await databases.listDocuments(
      AppWriteConfig.databasesId,
      AppWriteConfig.postsCollectionId,
      // orderDesc: It retrieves posts in Descending order, from the Newest to the Oldest.
      // orderAsc: It retrieves posts in Ascending order, from the Oldest to the Newest.
      // $: It is used to distinguish special or reserved fields that provide specific functionality in query and sorting operations within the database.
      [Query.orderDesc("$createdAt"), Query.limit(20)]
    );

    if (!posts) throw new Error("Failed to retrieve recent posts");

    return posts;
  } catch (error) {
    console.log(error);
  }
}

// ============================================================
// USER
// ============================================================

// ============================== GET USERS
/**
 * Retrieves a list of users with optional limit.
 * Handles errors by logging them and throwing an informative error message.
 * @param {number} [limit] - The maximum number of users to retrieve.
 * @returns {Promise<any>} The list of users.
 * @throws Will throw an error if:
 *   - "Failed to retrieve users": If querying the users database fails.
 */
export async function getUsers(limit?: number) {
  const queries: any[] = [Query.orderDesc("$createdAt")];

  if (limit) {
    queries.push(Query.limit(limit));
  }

  try {
    const users = await databases.listDocuments(
      AppWriteConfig.databasesId,
      AppWriteConfig.usersCollectionId,
      queries
    );

    if (!users) throw new Error("Failed to retrieve users");

    return users;
  } catch (error) {
    console.log(error);
  }
}

// ============================== GET USER BY ID
/**
 * Retrieves user data by user ID.
 * Handles errors by logging them and throwing an informative error message.
 * @param {string} userId - The ID of the user to retrieve.
 * @returns {Promise<any>} The user document.
 * @throws Will throw an error if:
 *   - "Failed to retrieve user": If querying the user by ID fails.
 */
// This function will return user data as an Object
export async function getUserById(userId: string) {
  try {
    const user = await databases.getDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.usersCollectionId,
      userId
    );
    if (!user) throw new Error("Failed to retrieve user");

    return user;
  } catch (error) {
    console.log(error);
  }
}

// ============================== UPDATE USER
/**
 * Updates user data with optional new file.
 * Handles errors by logging them and throwing informative error messages.
 * @param {IUpdateUser} user - The user data to update including optional file.
 * @returns {Promise<any>} The updated user document.
 * @throws Will throw an error if:
 *   - "Failed to upload file": If uploading the new file fails.
 *   - "Failed to get file preview": If retrieving the new file URL fails.
 *   - "Failed to update user": If updating the user in the database fails.
 */
export async function updateUser(user: IUpdateUser) {
  const hasFileToUpdate = user.file.length > 0;
  try {
    let image = {
      imageUrl: user.imageUrl,
      imageId: user.imageId,
    };

    if (hasFileToUpdate) {
      // Upload new file to AppWrite storage
      const uploadedFile = await uploadFile(user.file[0]);
      if (!uploadedFile) throw new Error("Failed to upload the file");

      // Get new file url
      const fileUrl = await getFilePreview(uploadedFile.$id);
      if (!fileUrl) {
        await deleteFile(uploadedFile.$id);
        throw new Error("Failed to get file preview");
      }

      image = { ...image, imageUrl: fileUrl, imageId: uploadedFile.$id };
    }

    //  Update user
    const updatedUser = await databases.updateDocument(
      AppWriteConfig.databasesId,
      AppWriteConfig.usersCollectionId,
      user.userId,
      {
        name: user.name,
        bio: user.bio,
        imageUrl: image.imageUrl,
        imageId: image.imageId,
      }
    );

    // Failed to update
    if (!updatedUser) {
      // Delete new file that has been recently uploaded
      if (hasFileToUpdate) {
        await deleteFile(image.imageId);
      }
      // If no new file uploaded, just throw error
      throw new Error("Failed to update the user");
    }

    // Safely delete old file after successful update
    if (user.imageId && hasFileToUpdate) {
      await deleteFile(user.imageId);
    }

    return updatedUser;
  } catch (error) {
    console.log(error);
  }
}
