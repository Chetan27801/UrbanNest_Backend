import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";

//Interface for user model
import { IUser } from "../types/user.type";

//Schema for user model
const userSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			required: [true, "Name is required"],
			trim: true,
			maxlength: [100, "Name cannot exceed 100 characters"],
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			select: false,
			minlength: [6, "Password must be at least 6 characters long"],
		},
		googleId: {
			type: String,
		},
		avatar: {
			type: String,
			default: "",
		},
		role: {
			type: String,
			enum: {
				values: ["tenant", "landlord", "admin"],
				message: "Role must be either Tenant, Landlord, or Admin",
			},
			default: "tenant",
		},
		phoneNumber: {
			type: String,
			trim: true,
		},
		isVerified: {
			type: Boolean,
			default: false,
		},
		verificationToken: {
			type: String,
			select: false,
		},
		verificationTokenExpiresAt: {
			type: Date,
			select: false,
		},
		resetPasswordToken: {
			type: String,
			select: false,
		},
		resetPasswordTokenExpiresAt: {
			type: Date,
			select: false,
		},

		//Role specific fields
		landlordProfile: {
			businessName: {
				type: String,
				trim: true,
			},
			licenseNumber: {
				type: String,
				trim: true,
			},
			rating: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},
			totalReviews: {
				type: Number,
				default: 0,
			},
			totalProperties: {
				type: Number,
				default: 0,
			},
			isVerifiedLandlord: {
				type: Boolean,
				default: false,
			},
		},
		tenantProfile: {
			occupation: {
				type: String,
				trim: true,
			},
			monthlyIncome: {
				type: Number,
				min: 0,
			},
			emergencyContact: {
				name: {
					type: String,
					trim: true,
				},
				phoneNumber: {
					type: String,
					trim: true,
				},
				relationship: {
					type: String,
				},
			},
			preferences: {
				priceRange: {
					min: {
						type: Number,
						min: 0,
					},
					max: {
						type: Number,
						min: 0,
					},
				},
				preferredLocation: [String],
				amenities: [String],
				petFriendly: {
					type: Boolean,
					default: false,
				},
			},
		},
		
		//favorites Properties
		favoriteProperties: {
			type: [Schema.Types.ObjectId],
			ref: "Property",
		},

		//Activity tracking
		lastActive: {
			type: Date,
			default: Date.now,
		},
		isOnline: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
		versionKey: false,
	}
);

//Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ role: 1 });

//Pre-save middleware to hash password
userSchema.pre("save", async function (next) {
	//Only hash password if it's modified and exists
	if (!this.isModified("password") || !this.password) {
		return next();
	}

	try {
		const saltRounds = 12;
		this.password = await bcrypt.hash(this.password, saltRounds);
		next();
	} catch (error) {
		next(error as Error);
	}
});

//Instance methods

//compare password
userSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	if (!this.password) {
		return false;
	}

	return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to hash password
userSchema.methods.hashPassword = async function (
	password: string
): Promise<string> {
	const saltRounds = 12;
	return bcrypt.hash(password, saltRounds);
};

//remove password from JSON output
userSchema.methods.toJSON = function () {
	const userObj = this.toObject();
	delete userObj.password;
	return userObj;
};

//Static methods

//find user by email
userSchema.statics.findByCredentials = async function (email: string) {
	return this.findOne({ email }).select("+password");
};

//TODO: Add methods for tenant and landlord profiles
//TODO: Add methods for verification and password reset

const User = model<IUser>("User", userSchema);

export default User;
