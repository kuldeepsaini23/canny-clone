// export async function createPost({
//   title,
//   description,
//   tag,
//   companySlug,
//   categoryId,
//   images,
// }: {
//   title: string;
//   description: string;
//   tag: FeatureTagType;
//   companySlug: string;
//   categoryId: string;
//   images: File[];
// }) {
//   try {
//     // console.log(
//     //   "Creating post:",
//     //   title,
//     //   description,
//     //   tag,
//     //   companySlug,
//     //   categoryId,
//     //   images
//     // );
//     // Authenticate user
//     const [subscription, allPosts] = await Promise.all([
//       prisma.subscription.findFirst({
//         where: { companySlug: companySlug },
//       }),
//       prisma.post.findMany({
//         where: { companySlug: companySlug },
//       }),
//     ]);

//     if (!subscription) {
//       return { status: 403, message: "Subscription not found" };
//     }

//     // Determine category limit based on plan
//     const categoryLimit =
//       subscription.plan === SubscriptionPlan.FREE
//         ? 20
//         : Number.MAX_SAFE_INTEGER; // Unlimited for paid plans

//     if (allPosts.length >= categoryLimit) {
//       return {
//         status: 403,
//         message: `You have reached the category limit (${
//           subscription.plan === SubscriptionPlan.FREE ? 20 : "Unlimited"
//         }) for your plan. Upgrade to add more.`,
//       };
//     }

//     const user = await getUser();
//     if (!user) {
//       return { status: 404, message: "User not found" };
//     }

//     const userId = user.id;
//     let uploadedImageUrls: string[] = [];

//     // Handle image uploads if images exist
//     if (images.length > 0) {
//       const uploadPromises = images.map(async (image) => {
//         const filePath = `posts/${Date.now()}-${image.name}`;

//         const supabase = await createClient();
//         const { error } = await supabase.storage
//           .from("canny-clone")
//           .upload(filePath, image, {
//             cacheControl: "3600",
//             upsert: false,
//           });

//         if (error) {
//           console.error("Error uploading image:", error);
//           throw new Error("Image upload failed");
//         }

//         // Get public URL of uploaded image
//         const { data: imageUrl } = supabase.storage
//           .from("canny-clone")
//           .getPublicUrl(filePath);
//         return imageUrl.publicUrl;
//       });

//       // Wait for all uploads to finish
//       uploadedImageUrls = await Promise.all(uploadPromises);
//     }

//     // Create new post in Prisma
//     const newPost = await prisma.post.create({
//       data: {
//         title,
//         description,
//         tag,
//         companySlug,
//         categoryId,
//         authorId: userId,
//         images: uploadedImageUrls, // Store image URLs in the database
//       },
//       include: {
//         author: {
//           select: {
//             name: true,
//             avatar: true,
//           },
//         },
//         _count: {
//           select: {
//             comments: true,
//             upvotes: true,
//           },
//         },
//       },
//     });

//     // Revalidate the posts page
//     revalidatePath(`/${companySlug}/feedback/${categoryId}`);
//     console.log("Post created:", newPost);

//     return { data: newPost, status: 200 };
//   } catch (error) {
//     console.error("Error creating post:", error);
//     return { status: 500, message: "Failed to create post" };
//   }
// }