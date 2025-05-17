import { MapPin, User } from 'lucide-react';

const Header = ({ userName, size = "default" }) => {
  const formattedName = userName
    ? userName.charAt(0).toUpperCase() + userName.slice(1)
    : 'User';

  // Define styles based on size
  const sizes = {
    default: {
      headerPadding: "py-10 px-6",
      containerMaxWidth: "max-w-6xl",
      boxPadding: "px-8 py-6",
      borderRadius: "rounded-2xl",
      iconSize: "h-10 w-10 mr-4",
      titleSize: "text-4xl",
      welcomeIconSize: "h-9 w-9 mr-4",
      welcomeTextSize: "text-2xl",
      spaceBetween: "mr-4",
    },
    large: {
      headerPadding: "py-16 px-12",
      containerMaxWidth: "max-w-7xl",
      boxPadding: "px-12 py-10",
      borderRadius: "rounded-3xl",
      iconSize: "h-14 w-14 mr-8",
      titleSize: "text-6xl",
      welcomeIconSize: "h-12 w-12 mr-8",
      welcomeTextSize: "text-4xl",
      spaceBetween: "mr-8",
    }
  };

  const style = sizes[size] || sizes.default;

  return (
    <header className={`bg-gradient-to-r from-blue-600 to-indigo-800 shadow-xl ${style.headerPadding}`}>
      <div className={`${style.containerMaxWidth} mx-auto`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-6 md:space-y-0">
          {/* <div className="flex items-center justify-center">
            <div className={`bg-white bg-opacity-15 backdrop-blur-sm ${style.borderRadius} ${style.boxPadding} border border-white border-opacity-20 shadow-2xl`}>
              <div className="flex items-center">
                <MapPin className={`${style.iconSize} text-teal-300`} />
                <span className={`font-bold ${style.titleSize} text-white tracking-wide`}>
                  Mark Attendance
                </span>
              </div>
            </div>
          </div> */}

          <div className="flex items-center justify-center">
            <div className={`bg-white bg-opacity-15 backdrop-blur-sm ${style.borderRadius} ${style.boxPadding} border border-white border-opacity-20 shadow-2xl`}>
              <div className="flex items-center">
                <User className={`${style.welcomeIconSize} text-teal-300`} />
                <span className={`${style.welcomeTextSize} text-white`}>
                  Welcome, <span className="font-bold text-teal-300">{formattedName}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
