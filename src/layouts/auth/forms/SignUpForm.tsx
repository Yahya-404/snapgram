import { z } from "zod";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Button,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from "@/components/ui/routes";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/shared/Loader";

import { useSignUpAccount, useSignInAccount } from "@/lib/TanStack/queries";
import { useUserContext } from "@/context/AuthProvider";
import { SignUpValidation } from "@/lib/validation";

// import Images & Icons
import LogoImage from "@/assets/images/logo.svg";

const SignUpForm = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { checkAuthUser, isLoading: isUserLoading } = useUserContext();

  // 1. Define your form.
  const form = useForm<z.infer<typeof SignUpValidation>>({
    resolver: zodResolver(SignUpValidation),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
  });

  // Queries
  const { mutateAsync: createUserAccount, isPending: isCreatingUser } =
    useSignUpAccount();
  const { mutateAsync: signInAccount, isPending: isSigningInUser } =
    useSignInAccount();

  // 2. Define a submit handler.
  const handleSignUp = async (user: z.infer<typeof SignUpValidation>) => {
    try {
      const newUser = await createUserAccount(user);
      if (!newUser) {
        toast({ title: "Sign up Failed, Please try again." });
        return;
      }

      const session = await signInAccount({
        email: user.email,
        password: user.password,
      });
      if (!session) {
        toast({ title: "Sign in Failed, Please try again." });
        navigate("/sign-in");
        return;
      }

      const isLoggedIn = await checkAuthUser();
      if (isLoggedIn) {
        form.reset();
        navigate("/");
      } else {
        toast({ title: "Sign in Failed, Please try again." });
        return;
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Form {...form}>
      <div className="sm:w-420 flex-center flex-col">
        <img src={LogoImage} alt="logo" />
        <h2 className="h3-bold md:h2-bold mt-4 sm:mt-8">
          Create a new account
        </h2>
        <p className="text-light-3 small-medium md:base-regular">
          To use Snapgram, please enter your details
        </p>
        <form
          onSubmit={form.handleSubmit(handleSignUp)}
          className="flex flex-col gap-3 w-full mt-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Name</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Username</FormLabel>
                <FormControl>
                  <Input type="text" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Email</FormLabel>
                <FormControl>
                  <Input type="email" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="shad-form_label">Password</FormLabel>
                <FormControl>
                  <Input type="password" className="shad-input" {...field} />
                </FormControl>
                <FormMessage className="shad-form_message" />
              </FormItem>
            )}
          />
          <Button type="submit" className="shad-button_primary">
            {isCreatingUser || isSigningInUser || isUserLoading ? (
              <div className="flex-center gap-2">
                <Loader /> Loading...
              </div>
            ) : (
              "Sign up"
            )}
          </Button>
          <p className="text-small-regular text-light-2 text-center mt-2">
            already have an account?
            <Link
              to="/sign-in"
              className="text-primary-500 text-small-semibold ml-1"
            >
              Log in
            </Link>
          </p>
        </form>
      </div>
    </Form>
  );
};

export default SignUpForm;
