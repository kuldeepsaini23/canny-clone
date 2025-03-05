import DashboardIcon from "@/icons/DashboardIcon";
import MapIcon from "@/icons/MapIcon";
import SettingsIcon from "@/icons/SettingsIcon";
import TimerIcon from "@/icons/TimerIcon";
import { BarChart3, Gift, Users } from "lucide-react";

export const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: DashboardIcon},
  { name: "Settings", href: "/settings", icon: SettingsIcon },
  { name: "Change Log ", href: "/change-logs", icon: TimerIcon},
  { name: "Feature Tracker", href: "/feature-tracker   ", icon: MapIcon },
];

export const settingTabs = [
  { value: "profile", name: "Profile" },
  { value: "team", name: "Team" },
  { value: "affiliates", name: "Affiliates" },
  { value: "billing", name: "Billing" },
  { value: "custom-domain", name: "Custom Domain" },
  { value: "notification", name: "Notification" },
];

export const subscriptionBenefits = [
  {
    value: "FREE",
    perks: [
      {
        icons: "🚀",
        perk: "Perk 1",
      },
      {
        icons: "🚀",
        perk: "Perk 2",
      },
      {
        icons: "🚀",
        perk: "Perk 3",
      },
    ],
  },
  {
    value: "STARTER",
    perks: [
      {
        icons: "🚀",
        perk: "Perk 1",
      },
      {
        icons: "🚀",
        perk: "Perk 2",
      },
      {
        icons: "🚀",
        perk: "Perk 3",
      },
    ],
  },
  {
    value: "BUSINESS",
    perks: [
      {
        icons: "🚀",
        perk: "Perk 1",
      },
      {
        icons: "🚀",
        perk: "Perk 2",
      },
      {
        icons: "🚀",
        perk: "Perk 3",
      },
    ],
  },
];

export const subscriptionPlans = [
  {
    id: "FREE",
    title: "Free Plan",
    description: "To test the waters",
    icon: Gift,
  },
  {
    id: "STARTER",
    title: "Starter Plan",
    description: "For lone warriors",
    icon: Users,
    priceId:'price_1QwMiLIld5Bk5htqbsUWglym'
  },
  {
    id: "BUSINESS",
    title: "Business Plan",
    description: "For big dogs",
    icon: BarChart3,
    priceId:'price_1QwMicIld5Bk5htqo5etIiti'
  },
];

export const planPricing = {
  "FREE": 0,
  "STARTER": 49,
  "BUSINESS": 99,
}