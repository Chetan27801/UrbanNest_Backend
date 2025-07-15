import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { IUserWithPassword } from "../types/user.type";
import {
	createUser,
	findUserByEmail,
	findUserByGoogleId,
	findUserById,
} from "../services/auth.services";

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			callbackURL: process.env.GOOGLE_CALLBACK_URL!,
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				// Check if user already exists with this Google ID
				let existingUser = (await findUserByGoogleId(
					profile.id
				)) as IUserWithPassword;

				if (existingUser) {
					return done(null, existingUser);
				}

				// Check if user exists with same email
				existingUser = (await findUserByEmail(
					profile.emails?.[0]?.value || ""
				)) as IUserWithPassword;

				if (existingUser) {
					// Link Google account to existing user
					existingUser.googleId = profile.id;
					if (profile.photos?.[0]?.value) {
						existingUser.avatar = profile.photos[0].value;
					}
					await existingUser.save();
					return done(null, existingUser);
				}

				// Create new user
				const newUser = await createUser({
					googleId: profile.id,
					name: profile.displayName,
					email: profile.emails?.[0]?.value || "",
					avatar: profile.photos?.[0]?.value || "",
					role: "tenant", // default role
				});

				return done(null, newUser);
			} catch (error) {
				return done(error as Error, undefined);
			}
		}
	)
);

passport.serializeUser((user: any, done) => {
	done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
	try {
		const user = await findUserById(id);
		done(null, user);
	} catch (error) {
		done(error, null);
	}
});

export default passport;
