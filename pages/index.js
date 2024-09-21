import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";

export default function Index({ initialRestaurants }) {
	const [voteStatus, setVoteStatus] = useState(null);
	const [openRestaurant, setOpenRestaurant] = useState(null); // Tracks which dropdown is open
	const [animation, setAnimation] = useState({}); // For dropdown animation
	const [restaurants, setRestaurants] = useState(initialRestaurants);
	const handleVote = async (foodPackId) => {
		const employeeName = "Employee Name"; // Replace with actual employee info

		try {
			await axios.post("http://localhost:3000/restaurants/vote", {
				foodPackId,
				employee: employeeName,
			});
			setVoteStatus("Vote successful!");

			// Fetch updated restaurants
			const res = await axios.get("http://localhost:3000/restaurants");
			setRestaurants(res.data); // Update the state with the new data
		} catch (error) {
			console.error(error);
			setVoteStatus("Vote failed.");
		}
	};

	const toggleDropdown = (restaurantId) => {
		if (openRestaurant === restaurantId) {
			setOpenRestaurant(null); // Close if already open
			setAnimation({ [restaurantId]: "slide-out" }); // Set animation class for closing
		} else {
			setOpenRestaurant(restaurantId); // Open the selected restaurant
			setAnimation({ [restaurantId]: "slide-in" }); // Set animation class for opening
		}
	};

	// Determine the current winner (you might need to adjust this logic based on your requirements)
	const getCurrentWinner = () => {
		let winner = { restaurant: "", foodPack: "", votes: 0 };
		restaurants.forEach((restaurant) => {
			restaurant.packs.forEach((pack) => {
				const packVotes = pack.votes.length;
				if (packVotes > winner.votes) {
					winner = {
						restaurant: restaurant.name,
						foodPack: pack.name,
						votes: packVotes,
					};
				}
			});
		});
		return winner;
	};

	const currentWinner = getCurrentWinner();

	return (
		<div className="flex">
			<div className="w-2/3 p-4">
				<h1 className="text-2xl font-bold mb-4">Today's Lunch Vote</h1>
				{voteStatus && <div className="mb-4 text-green-500">{voteStatus}</div>}
				{restaurants.map((restaurant) => (
					<div key={restaurant.id} className="mb-4 border p-4 rounded">
						<h2 className="text-xl font-semibold">{restaurant.name}</h2>
						<div className="flex items-center justify-between">
							<span>Total Votes: {restaurant.totalVotes}</span>
							<button
								onClick={() => toggleDropdown(restaurant.id)}
								className="flex items-center">
								{openRestaurant === restaurant.id ? (
									<FontAwesomeIcon icon={faChevronUp} />
								) : (
									<FontAwesomeIcon icon={faChevronDown} />
								)}
							</button>
						</div>
						{openRestaurant === restaurant.id && (
							<div
								className={`mt-2 overflow-hidden transition-all duration-300 ${
									animation[restaurant.id]
								}`}>
								<table className="min-w-full mt-2 border">
									<thead>
										<tr>
											<th className="border">Food Pack</th>
											<th className="border">Votes</th>
											<th className="border">Action</th>
										</tr>
									</thead>
									<tbody>
										{restaurant.packs.map((pack) => (
											<tr key={pack.id}>
												<td className="border">{pack.name}</td>
												<td className="border">{pack.votes.length}</td>
												<td className="border">
													<button
														onClick={() => handleVote(pack.id)}
														className="bg-blue-500 text-white px-2 py-1 rounded">
														Vote
													</button>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</div>
				))}
			</div>
			<div className="w-1/3 p-4 border-l">
				<h2 className="text-xl font-bold mb-4">Current Winner</h2>
				{currentWinner.votes > 0 ? (
					<div className="bg-green-100 p-4 rounded">
						<h3 className="text-lg font-semibold">
							{currentWinner.restaurant}
						</h3>
						<p className="text-md">{currentWinner.foodPack}</p>
						<p className="text-sm">Votes: {currentWinner.votes}</p>
					</div>
				) : (
					<p>No votes yet!</p>
				)}
			</div>
		</div>
	);
}

export async function getServerSideProps() {
	const res = await fetch("http://localhost:3000/restaurants");
	const data = await res.json();

	return {
		props: {
			initialRestaurants: data,
		},
	};
}
