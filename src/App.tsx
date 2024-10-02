import { Route, Routes } from "react-router-dom";

import AuthLayout from "./layouts/auth/AuthLayout";
import SignUpForm from "./layouts/auth/forms/SignUpForm";
import SignInForm from "./layouts/auth/forms/SignInForm";
import RootLayout from "./layouts/root/RootLayout";
import {
  CreatePost,
  EditPost,
  Explore,
  Home,
  PostDetails,
  Profile,
  SavedPosts,
  UpdateProfile,
  UsersCommunity,
} from "@/layouts/root/pages/routes";

import "./index.css";

const App = () => {
  return (
    <main className="flex h-screen">
      <Routes>
        {/* public routes */}
        <Route element={<AuthLayout />}>
          <Route path="/sign-in" element={<SignInForm />} />
          <Route path="/sign-up" element={<SignUpForm />} />
        </Route>
        {/* private routes */}
        <Route element={<RootLayout />}>
          <Route index element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/saved" element={<SavedPosts />} />
          <Route path="/users-community" element={<UsersCommunity />} />
          <Route path="/create-post" element={<CreatePost />} />
          <Route path="/update-post/:id" element={<EditPost />} />
          <Route path="/posts/:id" element={<PostDetails />} />
          <Route path="/profile/:id/*" element={<Profile />} />
          <Route path="/update-profile/:id" element={<UpdateProfile />} />
        </Route>
      </Routes>
    </main>
  );
};

export default App;
