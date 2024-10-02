import { Models } from "appwrite";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

import { checkIsLiked } from "@/lib/utils";
import {
  useDeleteSavedPost,
  useGetCurrentUser,
  useLikePost,
  useSavePost,
} from "@/lib/TanStack/queries";

// import Images & Icons
import LikedIcon from "@/assets/icons/liked.svg";
import LikeIcon from "@/assets/icons/like.svg";
import SavedIcon from "@/assets/icons/saved.svg";
import SaveIcon from "@/assets/icons/save.svg";

type PostStatsProps = {
  post: Models.Document;
  userId: string;
};

export const PostStats = ({ post, userId }: PostStatsProps) => {
  const location = useLocation();
  const likesList = post.likes.map((user: Models.Document) => user.$id);

  const [likes, setLikes] = useState<string[]>(likesList);
  const [isSaved, setIsSaved] = useState(false);

  const { mutate: likePost } = useLikePost();
  const { mutate: savePost } = useSavePost();
  const { mutate: deleteSavePost } = useDeleteSavedPost();
  const { data: currentUser } = useGetCurrentUser();

  // This code searches through the current user's (currentUser) saved records (save) for the record that has the same post ID (post.$id) as the current post. If the record is found, it is stored in the savedPostRecord variable. If the record is not found, savedPostRecord will be undefined.
  // currentUser?.save: Refers to The RelationShip between them in AppWrite.
  // find(): The function is a built-in method in JavaScript that operates on arrays. It searches within the array and returns the first element that meets the condition specified in the provided function.
  const savedPostRecord = currentUser?.save.find(
    // record: Is A Name Represent Each Element In The Save Array.
    (record: Models.Document) => record.post.$id === post.$id
  );

  // The code ensures that the isSaved state is set to true if there is a saved record (savedPostRecord is not empty), and false if there is no saved record. This effect will be applied whenever currentUser changes, meaning that the save status will be updated based on changes in the current user's data.
  useEffect(() => {
    // !! is a method to convert any value to either true or false.
    setIsSaved(!!savedPostRecord);
  }, [currentUser]);

  // The handleLikePost function manages the process of liking or unliking a post when clicking the icon. If the user has already liked the post, their like is removed. If the user has not liked the post, their like is added. After updating the array, the state is refreshed, and the changes are sent to the server.
  const handleLikePost = (
    // Event type (click event on an HTML image)
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    // Prevent the click event from propagating to parent elements (stop propagation).
    // This part of the code is used to prevent the event from propagating to parent elements. When the user clicks on the icon to save the post, this action ensures that no other potential click events in parent elements are executed.
    e.stopPropagation();

    // Create a copy of the current likes array
    let likesArray = [...likes];

    // Check if the userId is already in the likesArray
    if (likesArray.includes(userId)) {
      // If the userId is already liked, remove it from the array
      likesArray = likesArray.filter((Id) => Id !== userId);
    } else {
      // If the userId is not liked, add it to the array
      likesArray.push(userId);
    }

    // Update the state with the new likes array
    setLikes(likesArray);

    // Call a function to handle the like/unlike action, sending the postId and updated likesArray
    likePost({ postId: post.$id, likesArray });
  };

  // The handleSavePost function is used to handle a user's click on an icon to either save or remove a post from the list of saved posts. If the post is already saved, it will be deleted; if it is not saved, it will be saved. Additionally, the save status (isSaved) is updated accordingly to reflect the current state of the post.
  const handleSavePost = (
    e: React.MouseEvent<HTMLImageElement, MouseEvent>
  ) => {
    e.stopPropagation();

    // 1- If the post is already saved, remove it from saved posts
    // Check if the post is already saved
    if (savedPostRecord) {
      // 1- If saved, update state to unsaved and delete the saved post using its ID
      setIsSaved(false);
      return deleteSavePost(savedPostRecord.$id);
    }

    // 2- If not saved, save the post and update state to saved
    savePost({ userId: userId, postId: post.$id });
    setIsSaved(true);
  };

  const containerStyles = location.pathname.startsWith("/profile")
    ? "w-full"
    : "";

  return (
    <div
      className={`flex justify-between items-center z-20 ${containerStyles}`}
    >
      {/* Likes */}
      <div className="flex gap-2 mr-5">
        <img
          src={`${checkIsLiked(likes, userId) ? LikedIcon : LikeIcon}`}
          alt="like"
          width={20}
          height={20}
          onClick={(e) => handleLikePost(e)}
          className="cursor-pointer"
        />
        <p className="small-medium lg:base-medium">{likes.length}</p>
      </div>

      {/* Save */}
      <div className="flex gap-2">
        <img
          src={isSaved ? SavedIcon : SaveIcon}
          alt="share"
          width={20}
          height={20}
          className="cursor-pointer"
          onClick={(e) => handleSavePost(e)}
        />
      </div>
    </div>
  );
};
