import { useNavigate } from 'react-router-dom';

// Custom Hook for handling navigation
const useNavigation = () => {
  const navigate = useNavigate();

  // Navigate to a specific route
  const goTo = (path) => {
    navigate(path);
  };

  // Navigate to a route and replace the current history entry
  const replace = (path) => {
    navigate(path, { replace: true });
  };

  // Go back to the previous page in history
  const goBack = () => {
    navigate(-1);
  };

  // Go forward in the history stack
  const goForward = () => {
    navigate(1);
  };

  return { goTo, replace, goBack, goForward };
};

export default useNavigation;
