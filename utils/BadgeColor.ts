export const getBadgeStyles = (status: string) => {
  switch (status) {
    case "InDevelopment":
      return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
    case "Planned":
      return "border-blue-100 bg-blue-100 text-blue-500 hover:bg-blue-500"
    case "Completed":
      return "border-green-500 bg-green-100 text-green-500 hover:bg-green-500"
    default:
      return ""
  }
}

export const getFeatureColor = (tag: string) => {
  switch (tag) {
    case "NewFeature":
      return "text-emerald-500 border-emerald-500/20 bg-emerald-500/10"
    case "BugFix":
      return "bg-pink-500/10 text-pink-500 border-pink-500/20"
    case "Upgrade":
      return "bg-orange-500/10 text-orange-500 border-orange-500/20"
    default:
      return ""
  }
}