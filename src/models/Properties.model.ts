import { Schema, model } from "mongoose";
import { IProperty } from "../types/property.type";

const propertySchema = new Schema<IProperty>(
	{
		title: {
			type: String,
			required: [true, "Property title is required"],
			trim: true,
			maxlength: [100, "Property title must be less than 100 characters"],
		},
		description: {
			type: String,
			required: [true, "Property description is required"],
			trim: true,
			maxlength: [
				2000,
				"Property description must be less than 2000 characters",
			],
		},
		landlord: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: [true, "Landlord is required"],
		},

		//Pricing
		pricing: {
			montlyRent: {
				type: Number,
				required: [true, "Monthly rent is required"],
				min: [0, "Monthly rent must be positive"],
			},
			securityDeposit: {
				type: Number,
				required: [true, "Security deposit is required"],
				min: [0, "Security deposit must be positive"],
			},
			utilities: {
				isIncluded: {
					type: Boolean,
					default: false,
				},
				cost: {
					type: Number,
					default: 0,
					min: [0, "Utility cost must be positive"],
				},
			},
		},

		//Location
		location: {
			address: {
				type: String,
				required: [true, "Address is required"],
				trim: true,
			},
			city: {
				type: String,
				required: [true, "City is required"],
				trim: true,
			},
			state: {
				type: String,
				required: [true, "State is required"],
				trim: true,
			},
			country: {
				type: String,
				required: [true, "Country is required"],
				trim: true,
				default: "India",
			},
			postalCode: {
				type: String,
				required: [true, "Postal code is required"],
				trim: true,
			},
			neighborhood: {
				type: String,
				trime: true,
			},

			//Geolocation
			coordinates: {
				type: {
					type: String,
					enum: ["Point"],
					required: [true, "Coordinates type is required"],
				},
				coordinates: {
					type: [Number],
					required: [true, "Coordinates are required"],
					validate: {
						validator: function (val: number[]) {
							return val.length === 2;
						},
						message: "Coordinates must be an array of two numbers",
					},
				},
			},
		},

		//Property specifications
		specifications: {
			bedrooms: {
				type: Number,
				required: [true, "Number of bedrooms is required"],
				min: [0, "Number of bedrooms must be positive"],
			},
			bathrooms: {
				type: Number,
				required: [true, "Number of bathrooms is required"],
				min: [0, "Number of bathrooms must be positive"],
			},
			area: {
				type: Number,
				required: [true, "Area is required"],
				min: [1, "Area must be positive"],
			},
			propertyType: {
				type: String,
				enum: {
					values: [
						"apartment",
						"house",
						"condo",
						"townhouse",
						"studio",
						"loft",
						"room",
						"villa",
						"office",
						"other",
					],
					message: "Invalid property type",
				},
				required: [true, "Property type is required"],
			},
			furnished: {
				type: Boolean,
				default: false,
			},
			yearBuilt: {
				type: Number,
				min: [1900, "Year built must be after 1900"],
			},
			floorNumber: {
				type: Number,
				min: [0, "Floor number must be non-negative"],
			},
			floorPlan: {
				type: String,
				enum: ["studio", "1bhk", "2bhk", "3bhk", "4bhk", "5bhk", "other"],
			},
			totalFloors: {
				type: Number,
				min: [1, "Total floors must be at least 1"],
			},
			hasElevator: {
				type: Boolean,
				default: false,
			},
		},

		//Amenities and features
		amenities: [
			{
				type: String,
				enum: [
					"air_conditioning",
					"heating",
					"dishwasher",
					"washer_dryer",
					"garage",
					"parking",
					"balcony",
					"gym",
					"pool",
					"elevator",
					"doorman",
					"security",
					"pet_friendly",
					"smoking_allowed",
					"wheelchair_accessible",
					"hardwood_floors",
					"carpet",
					"tile",
					"fireplace",
					"walk_in_closet",
					"garden",
					"rooftop_access",
				],
				message: "Invalid amenity",
			},
		],

		//Highlights
		highlights: [
			{
				type: String,
				enum: [
					"newly_renovated",
					"high_ceilings",
					"natural_light",
					"city_view",
					"quiet_neighborhood",
					"close_to_transit",
					"shopping_nearby",
					"restaurants_nearby",
					"schools_nearby",
					"parks_nearby",
					"bike_friendly",
					"walkable",
					"low_crime_area",
				],
			},
		],

		//Policies
		policies: {
			petsAllowed: {
				type: Boolean,
				default: false,
			},
			smokingAllowed: {
				type: Boolean,
				default: false,
			},
			minimumLeaseTerm: {
				type: Number,
				default: 12,
				min: [1, "Minimum lease term must be at least 1 month"],
			},
			maximumLeaseTerm: {
				type: Number,
				default: 24,
				min: [1, "Maximum lease term must be at least 12 months"],
			},
		},

		//Media
		media: {
			images: [
				{
					url: {
						type: String,
						required: true,
					},
					caption: {
						type: String,
						trim: true,
					},
					isPrimary: {
						type: Boolean,
						default: false,
					},
				},
			],
		},

		//Availability
		availability: {
			isAvailable: {
				type: Boolean,
				default: true,
			},
			availableFrom: {
				type: Date,
				default: Date.now,
			},
			availableTo: {
				type: Date,
			},
		},

		// Statistics
		stats: {
			views: {
				type: Number,
				default: 0,
			},
			saves: {
				type: Number,
				default: 0,
			},
		},

		//Rating
		// Reviews and ratings
		rating: {
			average: {
				type: Number,
				default: 0,
				min: 0,
				max: 5,
			},
			count: {
				type: Number,
				default: 0,
			},
		},

		// Status
		status: {
			type: String,
			enum: {
				values: [
					"active",
					"inactive",
					"pending_approval",
					"rented",
					"maintenance",
				],
				message: "Invalid property status",
			},
			default: "active",
		},
	},
	{ timestamps: true, versionKey: false }
);

//TODO: Add or remove required fields

//TODO:Indexes for performance

//Virtual for full address
propertySchema.virtual("fullAddress").get(function () {
	return `${this.location?.address}, ${this.location.city}, ${this.location.state}, ${this.location.country}`;
});

const Property = model<IProperty>("Property", propertySchema);

export default Property;
