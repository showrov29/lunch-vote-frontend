import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import {
	Accordion,
	AccordionButton,
	AccordionIcon,
	AccordionItem,
	AccordionPanel,
	Box,
	ChakraProvider,
	SkeletonCircle,
	SkeletonText,
	useToast,
	Modal,
	Spinner,
	ModalOverlay,
	ModalContent,
	ModalBody,
} from "@chakra-ui/react";
export default function Index({ Component, initialRestaurants }) {
	const [voteStatus, setVoteStatus] = useState(null);
	const [openRestaurant, setOpenRestaurant] = useState(null); // Tracks which dropdown is open
	const [animation, setAnimation] = useState({}); // For dropdown animation
	const [restaurants, setRestaurants] = useState(initialRestaurants);
	console.log("🚀 ~ Index ~ initialRestaurants:", initialRestaurants);
	const [voting, setVoting] = useState(false);
	const toast = useToast();
	const handleVote = async (foodPackId) => {
		setVoting(true);
		const employeeName = "Employee Name"; // Replace with actual employee info

		try {
			await axios.post(
				"https://lunch-vote-backend.onrender.com/restaurants/vote",
				{
					foodPackId,
					employee: employeeName,
				}
			);

			// setVoteStatus("Vote successful!");

			// Fetch updated restaurants
			const res = await axios.get(
				"https://lunch-vote-backend.onrender.com/restaurants"
			);
			setRestaurants(res.data); // Update the state with the new data
			toast({
				title: "Vote successful!",
				status: "success",
				duration: 4000,
				position: "top",
				isClosable: true,
			});
			setVoting(false);
		} catch (error) {
			console.error(error);
			toast({
				title: "Vote failed!",
				status: "error",
				duration: 4000,
				position: "top",
				isClosable: true,
			});
			setVoting(false);
			// setVoteStatus("Vote failed.");
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
				const packVotes = pack?.votes.length;
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

	return restaurants === null ? (
		<Box padding="6" boxShadow="lg" bg="white">
			<SkeletonCircle size="10" />
			<SkeletonText mt="4" noOfLines={4} spacing="4" skeletonHeight="2" />
		</Box>
	) : (
		<ChakraProvider>
			{voting && (
				<Modal isOpen={voting} onClose={() => {}} isCentered>
					<ModalOverlay />
					<ModalContent background="transparent" boxShadow="none">
						<ModalBody
							display="flex"
							justifyContent="center"
							alignItems="center">
							<Spinner size="xl" thickness="8px" color="blue.500" />
						</ModalBody>
					</ModalContent>
				</Modal>
			)}

			<div className="flex">
				<div className="w-2/3 p-4">
					<h1 className="text-2xl font-bold mb-4">Today's Lunch Vote</h1>
					{voteStatus && (
						<div className="mb-4 text-green-500">{voteStatus}</div>
					)}
					<Accordion allowToggle transitionDuration={3100}>
						{restaurants?.map((restaurant) => (
							<AccordionItem
								key={restaurant.id}
								alignItems={"center"}
								mt={3}
								pb={2}>
								<AccordionButton _expanded={{ bg: "tomato", color: "white" }}>
									<Box as="span" flex={1} textAlign={"left"}>
										<h2 className="text-xl font-semibold">{restaurant.name}</h2>
										<AccordionIcon />
									</Box>
								</AccordionButton>
								<AccordionPanel pb={1}>
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
													<td className="border">{pack.votes?.length}</td>
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
								</AccordionPanel>
							</AccordionItem>
						))}
					</Accordion>
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
		</ChakraProvider>
	);
}

export async function getServerSideProps() {
	try {
		const res = await fetch(
			"https://lunch-vote-backend.onrender.com/restaurants"
		);
		const data = await res.json();

		return {
			props: {
				initialRestaurants: data,
			},
		};
	} catch (err) {
		return {
			props: {
				initialRestaurants: null,
			},
		};
	}
}
