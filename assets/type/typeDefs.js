const typeDefs = `#graphql
	type Feedback {
		id: String
		videoId: String
		rating: String
		comment: String
	}
  type Subscribe {
		id: String
		email: String
		token: String
	}
	type VerificationResponse {
		res: String
	}
	type Video {
		id: String
		videoName: String
		fileName: String
		takeaways: String
		duration: String
		sequence: String
	}
	type Query {
		feedbacks(id: Int): [Feedback]
    subscribes(id: Int): [Subscribe]
		verification(email: String!, token: String!): VerificationResponse
		videos: [Video]
	}
	type StartSubscribeResponse {
		success: String
	}
	type CreateFeedbackResponse {
		success: String
	}
	type Mutation {
		createFeedback(email: String!, videoId: String!, rating: String!, comment: String!): CreateFeedbackResponse
    startSubscribe(email: String!): StartSubscribeResponse
	}
  `;

  export default typeDefs