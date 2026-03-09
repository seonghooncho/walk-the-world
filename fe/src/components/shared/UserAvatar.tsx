interface UserAvatarProps {
  name: string;
  avatar?: string;
  size?: "sm" | "md" | "lg";
  showOnline?: boolean;
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const UserAvatar = ({ name, avatar, size = "md", showOnline }: UserAvatarProps) => {
  const initials = name.slice(0, 1);
  const colors = [
    "bg-primary",
    "bg-ocean",
    "bg-city-teal",
    "bg-accent",
    "bg-earth",
    "bg-gold",
  ];
  const colorIndex = name.charCodeAt(0) % colors.length;

  return (
    <div className="relative">
      <div
        className={`${sizeClasses[size]} ${
          avatar ? "" : colors[colorIndex]
        } flex items-center justify-center overflow-hidden rounded-full font-display font-semibold text-primary-foreground`}
      >
        {avatar ? (
          <img src={avatar} alt={name} className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </div>
      {showOnline && (
        <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card bg-success" />
      )}
    </div>
  );
};

export default UserAvatar;
