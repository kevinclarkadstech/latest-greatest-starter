import { DBFieldAttribute } from "better-auth";

export {
  user,
  userRelations,
  account,
  accountRelations,
  verification,
  session,
  sessionRelations,
} from "./auth-schema.generated";

export const additionalUserFields: Record<string, DBFieldAttribute> = {
  onboardedAt: {
    type: "date",
    defaultValue: null,
    fieldName: "onboarded_at",
    required: false,
  },
};
