import { Models } from "appwrite";

import { GridPostsList, Loader } from "@/components/shared/routes";
import { useGetCurrentUser } from "@/lib/TanStack/queries";

// import Images & Icons
import SaveIcon from "@/assets/icons/save.svg";

const SavedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();
  const savePosts = currentUser?.save
    .map((savePost: Models.Document) => ({
      ...savePost.post,
      creator: {
        imageUrl: currentUser.imageUrl,
      },
    }))
    .reverse();

  return (
    <div className="saved-container">
      <div className="flex gap-2 w-full max-w-5xl">
        <img
          src={SaveIcon}
          width={36}
          height={36}
          alt="edit"
          className="invert-white"
        />
        <h2 className="h3-bold md:h2-bold text-left w-full">Saved Posts</h2>
      </div>

      {!currentUser ? (
        <Loader />
      ) : (
        <ul className="w-full flex justify-center max-w-5xl gap-9">
          {savePosts.length === 0 ? (
            <p className="text-light-4">No available posts</p>
          ) : (
            <GridPostsList posts={savePosts} showStats={false} />
          )}
        </ul>
      )}
    </div>
  );
};

export default SavedPosts;
