export type DemoAccount = {
  id: string;
  name: string;
  email: string;
  password: string;
};
export type AuthUser = Pick<DemoAccount, "id" | "name" | "email">;

const accountsKey = "linguistpro.demo.accounts";
const sessionKey = "linguistpro.demo.session";

const read = <T>(key: string, fallback: T): T => {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "null") ?? fallback;
  } catch {
    return fallback;
  }
};

export const AuthStorage = {
  accounts: (): DemoAccount[] => read(accountsKey, []),
  saveAccounts: (accounts: DemoAccount[]) =>
    localStorage.setItem(accountsKey, JSON.stringify(accounts)),
  session: (): AuthUser | null => read<AuthUser | null>(sessionKey, null),
  saveSession: (user: AuthUser) =>
    localStorage.setItem(sessionKey, JSON.stringify(user)),
  clearSession: () => localStorage.removeItem(sessionKey),
};

export class AuthService {
  register(input: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): AuthUser {
    const name = input.name.trim();
    const email = input.email.trim().toLowerCase();
    if (!name || !email || !input.password)
      throw new Error("All fields are required.");
    if (input.password.length < 6)
      throw new Error("Password must be at least 6 characters.");
    if (input.password !== input.confirmPassword)
      throw new Error("Passwords do not match.");
    const accounts = AuthStorage.accounts();
    if (accounts.some((account) => account.email === email))
      throw new Error("An account with this email already exists.");
    const account = {
      id: crypto.randomUUID(),
      name,
      email,
      password: input.password,
    };
    AuthStorage.saveAccounts([...accounts, account]);
    const user = { id: account.id, name, email };
    AuthStorage.saveSession(user);
    return user;
  }

  login(email: string, password: string): AuthUser {
    const account = AuthStorage.accounts().find(
      (item) =>
        item.email === email.trim().toLowerCase() && item.password === password,
    );
    if (!account) throw new Error("Invalid email or password.");
    const user = { id: account.id, name: account.name, email: account.email };
    AuthStorage.saveSession(user);
    return user;
  }

  logout() {
    AuthStorage.clearSession();
  }
}
