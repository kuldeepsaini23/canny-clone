"use client";
import type React from "react";
import { useState, useCallback } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Paperclip, X, Send } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPost } from "@/action/post";
import { PostWithCounts } from "@/icons/lib/types";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import AuthRequiredModal from "@/components/Global/LoginModal/AuthRequiredModal";
import { Category } from "@prisma/client";

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  tag: z.enum(["NewFeature", "Upgrade", "BugFix"] as const),
  category: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

type Props = {
  companySlug: string;
  categoryId: string;
  user: User | null;
  categories: Category[] | [];
  isUserJoined: boolean;
};

const CreatePost = ({
  companySlug,
  categoryId,
  user,
  categories,
  isUserJoined,
}: Props) => {
  const [modal, setModal] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      tag: "NewFeature",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onMutate: async (newPost) => {
      await queryClient.cancelQueries({
        queryKey: [{ scope: "posts", companySlug, categoryId }],
      });
      const previousPosts = queryClient.getQueryData<PostWithCounts[]>([
        { scope: "posts", companySlug, categoryId },
      ]);

      // console.log("Previous posts", previousPosts);

      if (!user) {
        toast.error("You must be logged in to create a post");
        return { previousPosts };
      }

      const optimisticPost: PostWithCounts = {
        id: Date.now().toString(),
        ...newPost,
        createdAt: new Date(),
        updatedAt: new Date(),
        authorId: user.id,
        _count: { comments: 0, upvotes: 0 },
        deletedAt: null,
        postType: null,
        images: [],
        upvotes: [],
        hasUpvoted: false,
        category: { name: "" },
      };

      console.log("Optimistic post", optimisticPost);

      queryClient.setQueryData<{ pages: { data: PostWithCounts[] }[] }>(
        [{ scope: "posts", companySlug, categoryId }],
        (old) => {
          if (!old) return { pages: [{ data: [optimisticPost] }] };
          return {
            ...old,
            pages: [
              { data: [optimisticPost, ...old.pages[0].data] },
              ...old.pages.slice(1),
            ],
          };
        }
      );

      return { previousPosts };
    },
    onError: (err, newPost, context) => {
      queryClient.setQueryData(["posts"], context?.previousPosts);
      toast.error("Error creating post");
    },
    onSuccess: (data) => {
      console.log("Data", data);
      toast.success("Post created successfully");
    },

    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: [{ scope: "posts", companySlug, categoryId }],
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    console.log("🔴 values", values, user);

    if (!user || !isUserJoined) {
      setModal(true);
      return;
    } else {
      createPostMutation.mutate({
        ...values,
        companySlug,
        categoryId: values.category,
        images,
      });
      form.reset();
      setImages([]);
      setImagePreviews([]);
    }
  };

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) {
        const file = e.target.files[0];

        if (file && images.length < 1) {
          setImages([file]);

          const reader = new FileReader();
          reader.onloadend = () => {
            setImagePreviews([reader.result as string]);
          };
          reader.readAsDataURL(file);
        } else {
          toast.error("Only one image is allowed");
        }
      }
    },
    [images]
  );

  const removeImage = useCallback(() => {
    setImages([]);
    setImagePreviews([]);
  }, []);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Title"
                  {...field}
                  className="w-full text-lg font-semibold p-4 items-start rounded-xl border border-input bg-background"
                  disabled={createPostMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Description"
                  {...field}
                  rows={10}
                  className="max-h-[200px] w-full p-4 items-start rounded-xl border border-input bg-background"
                  disabled={createPostMutation.isPending}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-between gap-3 w-full">
          <div className="w-fit flex gap-3 items-start">
            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createPostMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-fit">
                        <SelectValue
                          placeholder="Select Tag"
                          className="px-3"
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="NewFeature">New Feature</SelectItem>
                      <SelectItem value="Upgrade">Upgrade</SelectItem>
                      <SelectItem value="BugFix">Bug Fix</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={createPostMutation.isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="w-fit">
                        <SelectValue
                          placeholder={
                            categories.length === 0
                              ? "No categories found"
                              : "Select category"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="image-upload"
              className={`cursor-pointer ${
                createPostMutation.isPending ? "opacity-50" : ""
              }`}
            >
              <Paperclip className="h-5 w-5" />
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                disabled={createPostMutation.isPending}
              />
            </label>
            <Button
              type="submit"
              variant="outline"
              className="border-input"
              disabled={createPostMutation.isPending}
            >
              <Send className="mr-2 h-4 w-4" />
              Create Post
            </Button>
          </div>
        </div>

        {imagePreviews.length > 0 && (
          <div className="relative w-32 h-32">
            <Image
              src={imagePreviews[0] || "/placeholder.svg"}
              alt="Selected image preview"
              width={128}
              height={128}
              objectFit="cover"
              className="rounded-md"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
              aria-label="Remove image"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </form>
      <AuthRequiredModal
        open={modal}
        setOpen={setModal}
        redirect={pathname}
        companySlug={companySlug}
        userId={user?.id || null}
      />
    </Form>
  );
};

export default CreatePost;
