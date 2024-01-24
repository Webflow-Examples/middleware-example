# Creating a simple middleware in node

Sometimes when using Webflow you need to [fetch data from an API endpoint and the write it to the DOM on page load](https://github.com/Webflow-Examples/fetch-api-and-write-to-dom). When using fetch on the front-end with Webflow the limitation is that there isn't a place in Webflow to store your API keys. In the event you find yourself needing a workaround here's a guide to creating your own middleware.

## What is middleware and how does it solve this problem?

Middleware serves several important functions in web applications. It not only enables secure communication with external APIs by safely handling sensitive data like API keys but also provides a centralized location for processing and modifying requests and responses. By leveraging middleware in your Webflow projects, you can maintain the integrity and security of your API interactions while still delivering the dynamic content and functionality your users expect.

TLDR; middleware stores our API keys for us. Now from Webflow we'll call our middleware endpoint and our middleware will call our origin endpoint with the key it stores.

## How the code works

At the top you'll see we're importing our modules. In this case we're using:

- Express (our framework/server)
- Cors (protects others from using our endpoint on their site)
- DotEnv (hides our API key for us)
- Axios (module that makes our api call for us)
- Node cache (to cache our data)

Next we get our variables from the `.env` file. Specifically we're getting out API Key so we can use it. We're also creating our Express app and creating our cache.

```js
// Load environment variables from a .env file
dotenv.config();

const app = express();
const cache = new NodeCache();
```

Then we set up our CORs configuration. CORs will allow us to limit calls in the browser so that only your site can use the endpoint. It's important to understand that people could still use tools like the terminal or Postman to hit your endpoint, but this is meant to keep others from using your endpoint for their own web projects.

```js
const corsOptions = {
  // Only requests from this domain are allowed
  origin: "https://yourdomain.com",
  // Response status to send on successful preflight request
  optionsSuccessStatus: 200,
};

// Apply the CORS middleware to the Express application with the specified options
app.use(cors(corsOptions));
```

After that we make define our route and make our API call. In this sample we just have one endpoint and we'll run this all out of our app.js file. If you need more routes, they can be defined in your app.js file and you can split them into different files.

Here's our commented code (you can see my route is `/books`):

```js
// Define a route for GET requests to '/books'
app.get("/books", async (req, res) => {
  try {
    // creact cache key and get cache
    const cacheKey = "books";
    const cachedData = cache.get(cacheKey);

    if (cachedData) {
      return res.json(cachedData); // Return cached data if available
    }

    // Retrieve the API key from environment variables
    const apiKey = process.env.API_KEY;

    // Set up request headers, including the Authorization header with the API key
    const headers = {
      Authorization: `Bearer ${apiKey}`,
    };

    // Make an HTTP GET request to the specified URL using Axios with the set headers
    const response = await axios.get(
      "https://api.airtable.com/v0/appiV3xCQ0KsaZS0g/books",
      { headers }
    );

    // Cache the response data for a certain period
    // e.g., 600 seconds or 10 minutes
    cache.set(cacheKey, response.data, 600);

    // Send the response data back to the client
    res.json(response.data);
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response in case of an exception
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
```

You'll notice our caching is set up to invalidate every 10 minutes. In my sample I'm using airtable so if I update that base the change will show up within 10 minutes. You can adjust this as needed.

Caching improves the performance of our server. With the data cached, the server doesn't have to hit the endpoint every time it's called. It also saves us on server costs and on the number of times we hit our origin API (if you have costs associated there).

And finally we declare our port and start the server up:

```js
// Define the port on which the server will listen
const port = process.env.PORT || 3000;

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
```

## Get started

Follow these steps to get this running with your own configuration:

1. Download the repository: Clone or download the repository from GitHub to your local machine.
2. Install dependencies: OPen your terminal and run npm install in the project directory to install all the dependencies listed in package.json.
3. Add your own API key: Create a .env file in the root of the project and add your own API key. For example, the file should contain a line like API_KEY=your_api_key_here. Make sure that .env is included in .gitignore to prevent it from being committed to your repository, as it contains sensitive information.
4. Update CORS configuration: Modify the CORS options in the application to match your domain or desired configuration. This is usually done in the file where the Express server is set up (e.g., app.js).
5. Update the endpoint: Modify the endpoint (/api route in this case) to include your specific logic for handling requests, accessing your APIs, or any other functionality you wish to implement.
6. Start the application: Run the application locally using `npm start` or deploy it to a server.

## Deploying it to a server

For this example, I used [Railway](https://railway.app/). It's very simple. Once you've pushed your code to GitHub you can create a project, select that repo, and you're up and running. But other places you can consider are:

- Vercel
- Digital Ocean
- Heroku
- AWS (Elastic Beanstalk or EC2)
- Google Cloud
- Microsoft Azure

Once up and running, use the URL it provides and navigate to your endpoint. You should now see your data returned in the browser. Now you're [ready for that front-end code](https://github.com/Webflow-Examples/fetch-api-and-write-to-dom)!
