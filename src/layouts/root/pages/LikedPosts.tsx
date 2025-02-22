import { useGetCurrentUser } from "@/lib/TanStack/queries";
import { GridPostsList, Loader } from "@/components/shared/routes";

const LikedPosts = () => {
  const { data: currentUser } = useGetCurrentUser();

  if (!currentUser)
    return (
      <div className="flex-center w-full h-full">
        <Loader />
      </div>
    );

  return (
    <>
      {currentUser.liked.length === 0 && (
        <p className="text-light-4">No liked posts</p>
      )}
      <GridPostsList posts={currentUser.liked} showStats={false} />
    </>
  );
};

export default LikedPosts;
