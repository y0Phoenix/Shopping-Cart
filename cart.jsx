// simulate getting products from DataBase
const products = [
  { name: "Apples_:", country: "Italy", cost: 3, instock: 10 },
  { name: "Oranges:", country: "Spain", cost: 4, instock: 3 },
  { name: "Beans__:", country: "USA", cost: 2, instock: 5 },
  { name: "Cabbage:", country: "USA", cost: 1, instock: 8 },
];
//=========Cart=============
const Cart = (props) => {
  const { Card, Accordion, Button } = ReactBootstrap;
  let data = props.location.data ? props.location.data : products;
  console.log(`data:${data}`);

  return <Accordion defaultActiveKey="0">{list}</Accordion>;
};

const useDataApi = (initialUrl, initialData) => {
  const { useState, useEffect, useReducer } = React;
  const [url, setUrl] = useState({
    url: initialUrl,
    fetch: true
  });

  const [state, dispatch] = useReducer(dataFetchReducer, {
    isLoading: false,
    isError: false,
    data: initialData,
  });
  console.log(`useDataApi called`);
  useEffect(() => {
    if (!url.fetch) return;
    console.log("useEffect Called");
    const fetchData = async () => {
      dispatch({ type: "FETCH_INIT" });
      console.log('fetch init');
      try {
        const result = await axios(url.url);
        console.log("FETCH FROM URl");
        dispatch({ type: "FETCH_SUCCESS", payload: {data: result.data.data, restocked: state.data.restocked++} });
        console.log(state);
      } catch (error) {
        dispatch({ type: "FETCH_FAILURE" });
      }
      setUrl({
        ...url,
        fetch: false
      });
    };
    fetchData();
  }, [url]);
  return [state, setUrl];
};
const dataFetchReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_INIT":
      return {
        ...state,
        isLoading: true,
        isError: false,
      };
    case "FETCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        isError: false,
        data: action.payload,
      };
    case "FETCH_FAILURE":
      return {
        ...state,
        isLoading: false,
        isError: true,
      };
    default:
      throw new Error();
  }
};

const Products = (props) => {
  const [cart, setCart] = React.useState([]);
  const [total, setTotal] = React.useState(0);
  const {
    Card,
    Accordion,
    Button,
    Container,
    Row,
    Col,
    Image,
    Input,
  } = ReactBootstrap;
  //  Fetch Data
  const { Fragment, useState, useEffect, useReducer } = React;
  const [query, setQuery] = useState("http://localhost:1337/api/products");
  const [{ data, isLoading, isError }, doFetch] = useDataApi(
    "http://localhost:1337/api/products",
    {data: [], restocked: 0}
  );
  const [items, setItems] = useState([]);
  useEffect(() => {
    console.log('resetting items', data.data);
    data.data.length > 0 && setItems(data.data)
  }, [data])
  console.log(`Rendering Products`, data);
  // Fetch Data
  const addToCart = (e) => {
    let name = e.target.name;
    const i = items.map(item => item.attributes.name).indexOf(name);
    let item = items[i];
    if (item.attributes.instock <= 0) return alert(`Can't add anymore ${item.attributes.name} to cart`);
    const tempdata = [...items];
    tempdata[i].attributes.instock = tempdata[i].attributes.instock - 1;
    setItems(tempdata);
    console.log(`add to Cart `, item);
    setCart([...cart, item]);
  };
  const deleteCartItem = (index, name) => {
    let newCart = cart.filter((item, i) => index != i);
    const i = items.map(item => item.attributes.name).indexOf(name);
    const tempdata = [...items];
    tempdata[i].attributes.instock = tempdata[i].attributes.instock + 1;
    setItems(tempdata);
    setCart(newCart);
  };
  const photos = ["apple.png", "orange.png", "beans.png", "cabbage.png"];

  let list = items.map((item, index) => {
    //let n = index + 1049;
    //let url = "https://picsum.photos/id/" + n + "/50/50";
    const {attributes: Item} = item;;
    return (
      <li key={index}>
        <Image src={photos[index % 4]} width={70} roundedCircle></Image>
        <Button variant="primary" size="large">
          {Item.name}:{Item.cost} inStock {Item.instock}
        </Button>
        <input name={Item.name} type="submit" onClick={addToCart}></input>
      </li>
    );
  });
  let cartList = cart.map((item, index) => {
    const {attributes: Item} = item
    return (
      <Card key={index}>
        <Card.Header>
          <Accordion.Toggle as={Button} variant="link" eventKey={1 + index}>
            {Item.name}
          </Accordion.Toggle>
        </Card.Header>
        <Accordion.Collapse
          onClick={() => deleteCartItem(index, Item.name)}
          eventKey={1 + index}
        >
          <Card.Body>
            $ {Item.cost} from {Item.country}
          </Card.Body>
        </Accordion.Collapse>
      </Card>
    );
  });

  let finalList = () => {
    let total = checkOut();
    let final = cart.map((item, index) => {
      return (
        <div key={index} index={index}>
          {item.name}
        </div>
      );
    });
    return { final, total };
  };

  const checkOut = () => {
    let costs = cart.map((item) => item.attributes.cost);
    const reducer = (accum, current) => accum + current;
    let newTotal = costs.reduce(reducer, 0);
    console.log(`total updated to ${newTotal}`);
    return newTotal;
  };
  // TODO: implement the restockProducts function
  const restockProducts = (url) => {
    doFetch({url, fetch: true});
  };

  return (
    <Container>
      <Row>
        <Col>
          <h1>Product List</h1>
          <ul style={{ listStyleType: "none" }}>{list}</ul>
        </Col>
        <Col>
          <h1>Cart Contents</h1>
          <Accordion>{cartList}</Accordion>
        </Col>
        <Col>
          <h1>CheckOut </h1>
          <Button onClick={checkOut}>CheckOut $ {finalList().total}</Button>
          <div> {finalList().total > 0 && finalList().final} </div>
        </Col>
      </Row>
      <Row>
        <form
          onSubmit={(event) => {
            restockProducts(query);
            console.log(`Restock called on ${query}`);
            event.preventDefault();
          }}
        >
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <button type="submit">ReStock Products</button>
        </form>
      </Row>
    </Container>
  );
};
// ========================================
ReactDOM.render(<Products />, document.getElementById("root"));
