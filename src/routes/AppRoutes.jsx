import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import PublicRoutes from "./PublicRoutes";
import ProtectedRoutes from "./ProtectedRoutes";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { PageLoader } from "@/components/common/PageLoader";
import NotFound from "@/components/common/NotFound";

// Pages are code-split; components that export by name are adapted with lazyNamed.
const lazyNamed = (loader, name) =>
  lazy(() => loader().then((module) => ({ default: module[name] })));

// ---- Public website ----
const About = lazy(() => import("@/pages/site/About"));
const AssociationEvents = lazy(() => import("@/pages/site/AssociationEvents"));
const BecomeMember = lazy(() => import("@/pages/site/BecomeMember"));
const CategoryAuthorizedDealers = lazy(() => import("@/pages/site/categories/AuthorizedDealers"));
const CategoryDuplicateRc = lazy(() => import("@/pages/site/categories/DuplicateRc"));
const CategoryEmiCalculator = lazy(() => import("@/pages/site/categories/EmiCalculator"));
const CategoryFeesStructure = lazy(() => import("@/pages/site/categories/FeesStructure"));
const CategoryImportantForms = lazy(() => import("@/pages/site/categories/ImportantForms"));
const CategoryInformationOnForms = lazy(() => import("@/pages/site/categories/InformationOnForms"));
const CategoryNewRegistrations = lazy(() => import("@/pages/site/categories/NewRegistrations"));
const CategoryNewVehicle = lazy(() => import("@/pages/site/categories/NewVehicle"));
const CategoryNews = lazy(() => import("@/pages/site/categories/News"));
const CategoryObtainNoc = lazy(() => import("@/pages/site/categories/ObtainNoc"));
const CategoryOtherStateVehicle = lazy(() => import("@/pages/site/categories/OtherStateVehicle"));
const CategoryOurOffice = lazy(() => import("@/pages/site/categories/OurOffice"));
const CategoryRtoList = lazy(() => import("@/pages/site/categories/RtoList"));
const CategoryRules = lazy(() => import("@/pages/site/categories/Rules"));
const CategoryTransferFees = lazy(() => import("@/pages/site/categories/TransferFees"));
const CategoryTransferOwnership = lazy(() => import("@/pages/site/categories/TransferOwnership"));
const CategoryUsedVehicleChecklist = lazy(
  () => import("@/pages/site/categories/UsedVehicleChecklist"),
);
const CategoryVehicleSafety = lazy(() => import("@/pages/site/categories/VehicleSafety"));
const Contact = lazy(() => import("@/pages/site/Contact"));
const Directory = lazy(() => import("@/pages/site/Directory"));
const Gallery = lazy(() => import("@/pages/site/Gallery"));
const Home = lazy(() => import("@/pages/site/Home"));
const Letter = lazy(() => import("@/pages/site/Letter"));
const Management = lazy(() => import("@/pages/site/Management"));
const PoliticalAchievements = lazy(() => import("@/pages/site/PoliticalAchievements"));
const PublicMemberProfile = lazy(() => import("@/pages/Profile/PublicMemberProfile"));
const PublicPartnerProfile = lazy(() => import("@/pages/Profile/PublicPartnerProfile"));
const Login = lazy(() => import("@/pages/Auth/Login"));

// ---- Admin ----
const DashboardOverview = lazyNamed(
  () => import("@/components/admin/DashboardOverview"),
  "DashboardOverview",
);
const BannerManagement = lazyNamed(
  () => import("@/components/admin/BannerManagement"),
  "BannerManagement",
);
const DirectoryLayout = lazy(() => import("@/pages/admin/DirectoryLayout"));
const DirectoryManagement = lazyNamed(
  () => import("@/components/admin/DirectoryManagement"),
  "DirectoryManagement",
);
const PartnerDirectory = lazyNamed(
  () => import("@/components/admin/PartnerDirectory"),
  "PartnerDirectory",
);
const CreateMember = lazy(() => import("@/pages/admin/CreateMember"));
const MemberDetailsPage = lazy(() => import("@/pages/admin/MemberDetailsPage"));
const PartnerDetailsPage = lazy(() => import("@/pages/admin/PartnerDetailsPage"));
const ImportantDatesManagement = lazyNamed(
  () => import("@/components/admin/ImportantDatesManagement"),
  "ImportantDatesManagement",
);
const ResetDirectory = lazyNamed(
  () => import("@/components/admin/ResetDirectory"),
  "ResetDirectory",
);
const ExpiredMembersManagement = lazyNamed(
  () => import("@/components/admin/ExpiredMembersManagement"),
  "ExpiredMembersManagement",
);
const GalleryManagement = lazyNamed(
  () => import("@/components/admin/GalleryManagement"),
  "GalleryManagement",
);
const EnquiryManagement = lazyNamed(
  () => import("@/components/admin/EnquiryManagement"),
  "EnquiryManagement",
);
const SuperAdminsManagement = lazyNamed(
  () => import("@/components/admin/SuperAdminsManagement"),
  "SuperAdminsManagement",
);
const SectionPlaceholder = lazyNamed(
  () => import("@/components/admin/SectionPlaceholder"),
  "SectionPlaceholder",
);

export default function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<PublicRoutes />}>
            <Route path="/about" element={<About />} />
            <Route path="/association-events" element={<AssociationEvents />} />
            <Route path="/become-member" element={<BecomeMember />} />
            <Route path="/categories/authorized-dealers" element={<CategoryAuthorizedDealers />} />
            <Route path="/categories/duplicate-rc" element={<CategoryDuplicateRc />} />
            <Route path="/categories/emi-calculator" element={<CategoryEmiCalculator />} />
            <Route path="/categories/fees-structure" element={<CategoryFeesStructure />} />
            <Route path="/categories/important-forms" element={<CategoryImportantForms />} />
            <Route
              path="/categories/information-on-forms"
              element={<CategoryInformationOnForms />}
            />
            <Route path="/categories/new-registrations" element={<CategoryNewRegistrations />} />
            <Route path="/categories/new-vehicle" element={<CategoryNewVehicle />} />
            <Route path="/categories/news" element={<CategoryNews />} />
            <Route path="/categories/obtain-noc" element={<CategoryObtainNoc />} />
            <Route path="/categories/other-state-vehicle" element={<CategoryOtherStateVehicle />} />
            <Route path="/categories/our-office" element={<CategoryOurOffice />} />
            <Route path="/categories/rto-list" element={<CategoryRtoList />} />
            <Route path="/categories/rules" element={<CategoryRules />} />
            <Route path="/categories/transfer-fees" element={<CategoryTransferFees />} />
            <Route path="/categories/transfer-ownership" element={<CategoryTransferOwnership />} />
            <Route
              path="/categories/used-vehicle-checklist"
              element={<CategoryUsedVehicleChecklist />}
            />
            <Route path="/categories/vehicle-safety" element={<CategoryVehicleSafety />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/image" element={<Gallery />} />
            <Route index element={<Home />} />
            <Route path="/letter" element={<Letter />} />
            <Route path="/management" element={<Management />} />
            <Route path="/political-achievements" element={<PoliticalAchievements />} />
            <Route path="/profile/member/:id" element={<PublicMemberProfile />} />
            <Route path="/profile/partner/:id" element={<PublicPartnerProfile />} />
            <Route path="/admin/login" element={<Login />} />
          </Route>

          <Route path="/admin" element={<ProtectedRoutes />}>
            <Route index element={<DashboardOverview />} />
            <Route path="banners" element={<BannerManagement />} />
            <Route path="directory" element={<DirectoryLayout />}>
              <Route index element={<DirectoryManagement />} />
              <Route path="partener" element={<PartnerDirectory />} />
              <Route path="create" element={<CreateMember />} />
              <Route path=":slug/details" element={<MemberDetailsPage />} />
              <Route path="partner/:slug/details" element={<PartnerDetailsPage />} />
            </Route>
            <Route path="important-dates" element={<ImportantDatesManagement />} />
            <Route path="reset-directory" element={<ResetDirectory />} />
            <Route
              path="reset-management"
              element={<SectionPlaceholder section="Reset Management" />}
            />
            <Route path="expired-members" element={<ExpiredMembersManagement />} />
            <Route path="our-staff" element={<SectionPlaceholder section="Our Staff" />} />
            <Route path="complaint" element={<SectionPlaceholder section="Complaint" />} />
            <Route path="image" element={<GalleryManagement />} />
            <Route path="enquiries" element={<EnquiryManagement />} />
            <Route path="super-admins" element={<SuperAdminsManagement />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
