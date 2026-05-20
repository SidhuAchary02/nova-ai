import AddCourse from "./_components/AddCourse";
import DashboardOnboardingTour from "./_components/DashboardOnboardingTour";
import UserCourseList from "./_components/UserCourseList";

const page = () => {
  return (
    <div>
      <AddCourse />
      <UserCourseList />
      <DashboardOnboardingTour />
    </div>
  );
};

export default page;
