export const getCategoryMeta = (value = "") => {
  const normalizedValue = value.toLowerCase();

  if (normalizedValue.includes("restaurant")) {
    return { icon: "🍽", label: "Restaurant" };
  }
  if (normalizedValue.includes("cafe")) {
    return { icon: "☕", label: "Cafe" };
  }
  if (normalizedValue.includes("museum")) {
    return { icon: "🖼", label: "Museum" };
  }
  if (normalizedValue.includes("park")) {
    return { icon: "🌳", label: "Park" };
  }
  if (normalizedValue.includes("food")) {
    return { icon: "🍽", label: "Restaurant" };
  }
  if (normalizedValue.includes("museums")) {
    return { icon: "🖼", label: "Museum" };
  }
  if (normalizedValue.includes("parks")) {
    return { icon: "🌳", label: "Park" };
  }

  return { icon: "🏛", label: "Attraction" };
};

const CategoryIcon = ({ interest, category, className = "" }) => {
  const meta = getCategoryMeta(category || interest || "");

  return <span className={className}>{meta.icon}</span>;
};

export default CategoryIcon;
