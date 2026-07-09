import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { useProfile } from "./api/use-profile"
import { ProfileError } from "./components/profile-error"
import { ProfileForm } from "./components/profile-form"
import { SettingsBackButton } from "@/features/settings/components/settings-back-button"
import { ProfileSkeleton } from "./components/profile-skeleton"

const ProfileSettingsPage = () => {
  const { profile, isLoading, isFetching, isError, error, refetch } = useProfile()

  if (isLoading && !profile) {
    return <ProfileSkeleton />
  }

  if (isError) {
    return (
      <ProfileError
        error={error}
        onRetry={() => void refetch()}
        isRetrying={isFetching}
      />
    )
  }

  if (!profile) {
    return (
      <main className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
        <SettingsBackButton />

        <header>
          <h1 className="font-heading text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            Profile
          </h1>
        </header>
        <Empty className="border border-dashed border-border">
          <EmptyHeader>
            <EmptyTitle>No profile found</EmptyTitle>
            <EmptyDescription>
              Your account profile could not be found.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </main>
    )
  }

  return (
    <ProfileForm
      key={`${profile.storeAdmin.updatedAt}-${profile.coldStorage.updatedAt}`}
      profile={profile}
      onRefresh={() => void refetch()}
      isRefreshing={isFetching}
    />
  )
}

export default ProfileSettingsPage
