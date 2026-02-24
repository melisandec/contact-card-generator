export function useAuth() {
  // Simplified auth hook without next-auth dependency for standalone usage
  return {
    isAuthenticated: false,
    isLoading: false,
    user: null,
    signIn: (provider?: string) => {
      console.log('Sign in with', provider);
    },
    signOut: () => {
      console.log('Sign out');
    },
  };
}
