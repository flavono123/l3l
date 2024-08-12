type BadgeColor = "blue" | "grey" | "green" | "red" | undefined;

export function generateBadgeColor(
  key: string,
): "blue" | "grey" | "green" | "red" | undefined {
  const badgeColors: BadgeColor[] = ["grey", "blue", "red", "green"];

  return badgeColors[key.length % badgeColors.length];
}
