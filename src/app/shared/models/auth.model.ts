import { AdditionalUserInfo, User } from '@firebase/auth';

export interface ISignIn {
  accessToken: string | undefined;
  user: User;
  additionalUserInfo: AdditionalUserInfo | null;
}
