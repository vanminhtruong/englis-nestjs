export default {
  title: 'Profile',
  subtitle: 'Manage your personal information and preferences',
  editProfile: 'Edit Profile',
  exportData: 'Export Data',
  importData: 'Import Data',
  sections: {
    overview: 'Overview',
    accountInfo: 'Account Information',
    appearance: 'Appearance',
  },
  fields: {
    fullName: 'Full name',
    email: 'Email',
    avatar: 'Avatar URL',
    theme: 'Theme',
  },
  stats: {
    totalScore: 'Total Score',
    totalWords: 'Total Words',
    memberSince: 'Member since',
    lastUpdated: 'Last updated',
  },
  actions: {
    saveChanges: 'Save changes',
    cancel: 'Cancel',
  },
  messages: {
    updateSuccess: 'Profile updated successfully',
    updateError: 'Failed to update profile',
    exportSuccess: 'Data exported successfully',
    exportError: 'Failed to export data',
    importSuccess: 'Data imported successfully',
    importError: 'Failed to import data',
    importNoChanges: 'This data already exists',
    importStats: 'Added {new} new words, updated {updated} words, skipped {skipped} duplicates',
  },
}
