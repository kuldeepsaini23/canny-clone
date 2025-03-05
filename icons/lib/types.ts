import {
  Affiliate,
  Category,
  ChangeLog,
  Comment,
  Company,
  Post,
  Prisma,
  Role,
  Subscription,
  User,
} from "@prisma/client";

export type SettingsUser = Prisma.UserGetPayload<{
  include: {
    affiliates: true;
    referredBy: true;
    roles: {
      include: {
        company: true;
      };
    };
    subscription: true;
    notifications: true;
  };
}>;

export type PostSelectFilter = "recent" | "oldest" | "relevant" | "votes";

export type PostWithCounts = Post & {
  _count: { comments: number; upvotes: number };
  upvotes: { userId: string }[];
  hasUpvoted: boolean;
  category: { name: string };
};

export type PostWithType = Post & {
  _count: { upvotes: number; comments: number };
};

export type CommentsWithUser = Comment & {
  user: User;
  replies: CommentsWithUser[];
  likes: { userId: string }[];
  _count: {
    likes: number;
    replies: number;
  };
  hasLiked?: boolean;
};

export type ChangeLogWithUser = ChangeLog & {
  Category: Category[];
  user: User;
};

export type FeedbackSortOption = "comments" | "recent" | "votes";

export type TimePeriod = "daily" | "weekly" | "monthly" | "yearly";

export type inviteType = {
  receiverEmail: string;
  senderId: string;
};

export type RoleWithUser = Role & {
  user: User;
};


export type AffiliateWithReferred = Affiliate & {
  referred: User & {
    subscription: Subscription
  };
};


export type RoleWithCompany = Role & {
  company: Company;
}; 