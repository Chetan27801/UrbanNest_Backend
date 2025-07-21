export enum Highlight {
	HighSpeedInternetAccess = "HighSpeedInternetAccess",
	WasherDryer = "WasherDryer",
	AirConditioning = "AirConditioning",
	Heating = "Heating",
	SmokeFree = "SmokeFree",
	CableReady = "CableReady",
	SatelliteTV = "SatelliteTV",
	DoubleVanities = "DoubleVanities",
	TubShower = "TubShower",
	Intercom = "Intercom",
	SprinklerSystem = "SprinklerSystem",
	RecentlyRenovated = "RecentlyRenovated",
	CloseToTransit = "CloseToTransit",
	GreatView = "GreatView",
	QuietNeighborhood = "QuietNeighborhood",
}

export enum Amenity {
	WasherDryer = "WasherDryer",
	AirConditioning = "AirConditioning",
	Dishwasher = "Dishwasher",
	HighSpeedInternet = "HighSpeedInternet",
	HardwoodFloors = "HardwoodFloors",
	WalkInClosets = "WalkInClosets",
	Microwave = "Microwave",
	Refrigerator = "Refrigerator",
	Pool = "Pool",
	Gym = "Gym",
	Parking = "Parking",
	PetsAllowed = "PetsAllowed",
	WiFi = "WiFi",
}

export enum PropertyType {
	Rooms = "Rooms",
	Tinyhouse = "Tinyhouse",
	Apartment = "Apartment",
	Villa = "Villa",
	Townhouse = "Townhouse",
	Cottage = "Cottage",
}

export enum ApplicationStatus {
	Pending = "Pending",
	Rejected = "Rejected",
	Approved = "Approved",
}

export enum PropertyStatus {
	Available = "Available",
	Occupied = "Occupied",
	UnderMaintenance = "UnderMaintenance",
}

export enum PaymentStatus {
	Pending = "Pending",
	Paid = "Paid",
	PartiallyPaid = "PartiallyPaid",
	Overdue = "Overdue",
}

// Helper functions to get enum values as arrays
export const getEnumValues = <T extends Record<string, string>>(
	enumObject: T
): string[] => {
	return Object.values(enumObject);
};
