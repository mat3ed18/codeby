import React, { useState, useEffect } from "react";
import Head from 'next/head';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import AddShoppingCartIcon from '@mui/icons-material/AddShoppingCart';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Divider from "@mui/material/Divider";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ButtonGroup from "@mui/material/ButtonGroup";
import Alert from '@mui/material/Alert';
import axios from "axios";

export default function Home() {

    const [products, setProducts] = useState([]);
    const [carrinho, setCarrinho] = useState([]);
    const [listaItens, setListaItens] = useState([]);
    const [freteGratis, setFreteGratis] = useState("none");
    const [totalCompra, setTotalCompra] = useState(0);

    const array_chunks = (array, chunk_size) => Array(Math.ceil(array.length / chunk_size)).fill().map((_, index) => index * chunk_size).map(begin => array.slice(begin, begin + chunk_size));

    const real = (valor) => parseFloat(valor).toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});

    const ax = axios.create({
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        }
    });

    useEffect(() => {
        ax.get("products.json").then((response) => setProducts(array_chunks(response.data, 5)));
    }, []);
    
    function titleProduct(text) {
        const palavras = text.split(" ");
        return (palavras.length > 1) ? palavras[0] + " " + palavras[1] + "..." : text;
    }

    function listarProdutos() {
        const html = [];
        products.forEach((produtos, i) => {
            const list = [];
            produtos.forEach((produto, e) => {
                list.push(
                    <Card style={{ width: "19%", marginRight: "1%" }}>
                        <CardMedia
                            component="img"
                            alt="produto"
                            height="140"
                            image={produto.items[0].images[0].imageUrl}
                        />
                        <CardContent>
                            <Typography component="div" className="product_title">
                                {titleProduct(produto.productName)}
                            </Typography>
                            <Typography variant="body0" color="text.primary" className="fw6">
                                {real(produto.items[0].sellers[0].commertialOffer.Price)}
                            </Typography>
                        </CardContent>
                        <CardActions style={{marginTop: "-5%"}}>
                            <IconButton id="addItem" onClick={() => { addCart({id: produto.productId, nome: produto.productName, valor: produto.items[0].sellers[0].commertialOffer.Price, imagem: produto.items[0].images[0].imageUrl, qtd: 1})}} >
                                <AddShoppingCartIcon/>
                            </IconButton>
                            <IconButton>
                                <FavoriteBorderIcon/>
                            </IconButton>
                        </CardActions>
                    </Card>
                );
            });

            html.push(
                <><div style={{ display: "flex", flexDirection: "row" }}>
                    {list}
                </div><br/></>
            );
        });
        return html;
    }

    function addCart(product) {
        const cart = carrinho;
        let adiciona = true;

        for (let i = 0; i < cart.length; i++) {
            // na API tem itens iguais, portanto ficará assim
            if (cart[i] != null && cart[i].nome == product.nome) {
                adiciona = false;
                cart[i].qtd += 1;
            }
        }

        document.getElementById("qtd_carrinho").innerHTML = parseInt(document.getElementById("qtd_carrinho").innerHTML) + 1;

        if (adiciona) cart.push(product);

        setCarrinho(cart);
        updateCart();
    }

    function updateQtd(idProduct, qtd) {
        const cart = carrinho;
        const totalItens = 0;

        for (let i = 0; i < cart.length; i++) {
            if (cart[i] != null) {
                if (cart[i].id == idProduct) cart[i].qtd = qtd;
                if (cart[i].id == idProduct && qtd == 0) delete cart[i];
                if (cart[i] != null) totalItens += cart[i].qtd;
            }
        }

        document.getElementById("qtd_carrinho").innerHTML = parseInt(totalItens);

        setCarrinho(cart);
        updateCart();
    }

    function updateCart() {
        const html = [];
        const valorCompra = 0;
        carrinho.forEach((item) => {
            html.push(
                <><ListItem alignItems="flex-start">
                    <ListItemAvatar>
                        <Avatar alt="Remy Sharp" src={item.imagem} />
                    </ListItemAvatar>
                    <ListItemText
                        primary={titleProduct(item.nome)}
                        secondary={<React.Fragment>
                            <b>{real(item.valor)}</b>
                        </React.Fragment>} />
                    <ButtonGroup
                        size="small"
                        style={{ width: "40%", margin: "0%", alignSelf: "center" }}
                        variant="contained"
                    >
                        <IconButton onClick={() => {
                            document.getElementById("qtd" + item.id).value = parseInt(document.getElementById("qtd" + item.id).value) > 0 ? parseInt(document.getElementById("qtd" + item.id).value) - 1 : 0;
                            updateQtd(item.id, document.getElementById("qtd" + item.id).value);
                        } }><RemoveIcon /></IconButton>
                        <input
                            type="number"
                            min="0"
                            id={"qtd" + item.id}
                            value={item.qtd}
                            style={{
                                width: "100%",
                                padding: "2% 6%",
                                fontSize: "1em",
                                border: "none"
                            }} />
                        <IconButton onClick={() => {
                            document.getElementById("qtd" + item.id).value = parseInt(document.getElementById("qtd" + item.id).value) + 1;
                            updateQtd(item.id, document.getElementById("qtd" + item.id).value);
                        } }><AddIcon /></IconButton>
                    </ButtonGroup>
                </ListItem><Divider variant="inset" component="li" /></>
            );
            valorCompra += item.valor * item.qtd;
        });

        if (valorCompra > 0) html.push(
            <div id="totalCart">
                <div className="label">TOTAL</div>
                <div className="total">{real(valorCompra)}</div>
            </div>
        );

        if (valorCompra > 10) setFreteGratis("flex");
        else setFreteGratis("none");      

        setTotalCompra(valorCompra);
        setListaItens(html);
    }

    // unificar a lista de itens

    Array.prototype.unique = function () {
        var a = this.concat();
        for (let i = 0; i < a.length; ++i) {
            for (var j = i + 1; j < a.length; ++j) {
                if (a[i].nome === a[j].nome && a[i].valor === a[j].valor) a.splice(j--, 1);
            }
        }
        return a;
    };

    return (
        <div className="container">

            {/* CABEÇALHO */}

            <Head>
                <title>Codeby - Sua melhor empresa de tecnologia</title>

                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta httpEquiv="Content-Type" content="text/html;charset=utf-8" />

                <link rel="icon" href="https://codebylatam.vteximg.com.br/arquivos/cby-apple-icon-57x57.png?v=636945605003430000" />
                <link href="https://codeby.myvtex.com/files/cby-r-codebyshop-app.min.css" rel="stylesheet" />
                <link href="https://codeby.myvtex.com/files/cby-r-codebyshop-home.min.css" rel="stylesheet" type="text/css"></link>
                <link href="styles.css" rel="stylesheet" type="text/css"></link>

                <script language="javascript" src="https://io.vtex.com.br/front-libs/jquery/1.8.3/jquery-1.8.3.min.js?v=1.5.54.2472" type="text/javascript"></script>
            </Head>

            {/* MENU */}

            <header className="fixed top-0 right-0 left-0 z-999 bg-white relative-l">
                <div data-collapse="medium" data-animation="default" data-duration="400" data-easing="ease-out" className="wrap cc-menu w-nav cby-container">

                    {/* LOGO */}

                    <a
                        href="#"
                        className="brand w-nav-brand w--current"
                        style={{ backgroundImage: `url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAAAwCAMAAAChd4FcAAABI1BMVEUAAAAAM0kAM0kAi+oAUH8AM0kAM0kAM0kAM0kAi+oAM0kAM0kAM0kAM0kAM0kAi+oAi+oAM0kAM0kAM0kAi+oAM0kAM0kAM0kAi+oAi+oAM0kAi+oAM0kAM0kAM0kAM0kAM0kAi+oAM0kAM0kAi+oAi+oAi+oAM0kAM0kAM0kAi+oAM0kAM0kAM0kAi+oAi+oAM0kAM0kAM0kAi+oAi+oAM0kAM0kAM0kAM0kAM0kAM0kAi+oAi+oAi+oAi+oAi+oAi+oAM0kAi+oAM0kAi+oAM0kAi+oAi+oAi+oAM0kAi+oAi+oAi+oAi+oAi+oAi+oAi+oAM0kAi+oAi+oAM0kAM0kAi+oAM0kAM0kAi+oAi+oAi+oAi+oAi+oAM0kAM0kAi+rDCRXhAAAAX3RSTlMAIFBAAvsPCgb6rfLBs5Rd8ejjiCAU9tTFqXwFx7iOcBgJ7N7Ku7WloIFNSz4x9XpsLB395tjNZVpVRTYwF+rfz6mhnZuYlo5WNhvYZhEPk3Ng7YN3dCgoGw2HRz05vHRvZzMAAAW1SURBVFjD7ZhpW9pAEMf/1JAAcoiUS0BAbjwQFK9WREEUrVqtttorfP9P0ZDZ3YQcPn3R55EX/b1xdzYk/8zs7EzEv0I5X/SGCniV2+FS766It6GuauxJeI3qRGOIN8HnVads4hXeT6b4M3gLZFXnHV7h50TnPf6GtxC48F/gf4EG/wX+e4HywSBbKnVDK5ajrP0YSpZK2fq9DBuefCC5vJwM5D12gR1tLbrWzRn3MwTeRIap6+vy2acrCI7TJ5WPlhdKnYyKIArhhMpJHkrgrGeF2Vv3YIZxThWENmYFboaMtez6rMCFM/+EU/0ARkqbLdGM0Zxedkbj/UXVzO8OmeOhGXPiSYJACasWDIG+1VlrIM4F2mG1+Wo6JoWGPo0taEjnqoWoHpdvy1b7qQ+MeFZ1FSgHreaShwQ6UT6Gxg1NlkSUf5Cbe9AYqDbWngFP1G4PMB/Ke6qrQMVB+3KHBDrRv4XGiCbX7AEvPZp/BrCtOrACJelkb0AnoLoLHDgt7PlIoBNVPYxDmrAgR2jWmqZigmfB79XGgEd1FTER73oslvPyi/TgH4jMya3GTtdmBB7x8WJt5SlcMt7YLNBfGQ1TO3z2CRqZE318CZ2WPklBo6YStWf9RQ6X6UkFJmntXnd6nOdEbpoE/DXO45hOtxcNgVKSSW8odA5Emdy4IdD/5UVPjCGb7xYBKU3jXzMe/A5wIXkwCtMtNJBi5u1t9lobOGTDezDaUSHwiOk7AuO5xFwoBG4tgBExXHgxuwdvlvhKnvkCAt/69iZQoue0IWiIXRiiUQyCDSGwzraIR7BOlq4QGIHgC1kquNmxZHGTDLvsYYuytUioOmEYKOSmLCSKaFSBQYALXFbdKDCBKRgUdynmRfs5GNnRV9gNB7DwTrW38Kt0XHPx5w7Xv5NVVzYWeNQEIrIfUTb0mRWmoepsw8I2RViCQGw9mcVzHyYKTGBbdaWzwMWYuCRbE1fVhxStCJr93tktE3gAC3mKIswcsQexv4cwoTCBm6obAcdu5gfZLuGK9+89eCA8aP+Nhwn8pjrjrStc4K+ZOHIPukLZWoMFlnobMHFO+YQOd4mJfSZQMZLYTMdnlLoWTJzxsBcvdncvMjBxnO6dtHj6JWRzuLTJs6pTh4FMFSMIiQZeDwTSHs/iLrVsknvDepIxidhiWUxKz2CQ6VMt3redae2ot+FD0ubCc1GzaqyoSKYtywWG+bkviOdXNphA4gsEaX4O3tLgBwQtehvEE+QO6uR4kxX0PbJKNwZjRSU8Iv5qzScCLASO2Z4TabcRnYZcCCS3ENJIHN1XNHj4YD5kqB8M816vrYc3v0hVTGb1NbEi624N8csAUW/V7qGizcYhc7PAm8GBR3dfjLJwTAIZlZ8SkGn2eS3OANesTLeKeuhHEwYQF81IN1APJkQ38yQSMFg7TYqu2kMHjpgn99Zm262x0WLVaqI13CaBgodyf0lMInQgEkvVu7uKX6zR+WvnEVLQZjRO5/Ar/WDDecG9H0wb29EOnO+4XADiXbs9DMKXcxconTr1q+4Cyy9UllOOq8b+N9PVA1mw9fUxkbdKwFUgfHWrORun/245kboFceuokBWx2R6kLjt+uUXNxU3KJ8xrCcqpttNXojdG2X5Mebk1MbHzPQNO5rvfTSCUR0NiaAzBZsAr5DVkzNAJCxmL4c6+/lMwCqtrQl7tGxhDvZBcjYREf/orzHxNC4lLD0IgIW2snAaDufB9ATPED8K5YDDQOPLBhrIeC2hrsXVl2nCFck8+c9sbCwWzudUD2eT1z6nKNGNfLi+q5X5lFLmBlZvLu0q5XL1oFk9IJ+aVJu9u54tMBsT7XV4W54njtH8n/XGq83J3QnzFPFGmD7tqtWd8088THyZWtubLgU2bwE+YK46t53QLc8bn2fhGMHcs9E09znvMI78uylqf2Ku05lOeA38A3/3RiqQdZpEAAAAASUVORK5CYII=)` }}
                    ></a>

                    {/* MENU (FIXO E LATERAL) */}

                    <nav role="navigation" id="navmenu" className="nav-menu w-nav-menu">
                        <a href="#tour" onClick={() => { document.getElementById("navmenu").classList.remove("open"); } } className="menu-item-wrap testesnow">
                            <div className="menu-item">Tech Tour</div>
                            <div className="menu-item-deco-line"></div>
                        </a>
                        <a href="#produtos" onClick={() => { document.getElementById("navmenu").classList.remove("open"); } } className="menu-item-wrap">
                            <div className="menu-item">Produtos</div>
                            <div className="menu-item-deco-line"></div>
                        </a>
                    </nav>

                    {/* BOTÃO DO CARRINHO */}

                    <div className="relative dib">
                        <a onClick={() => { document.getElementById("carrinho").classList.remove("closed"); } } data-node-type="commerce-cart-open-link" className="cart-button">
                            <img
                                src="data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' id='Capa_1' x='0px' y='0px' viewBox='0 0 489 489' style='enable-background:new 0 0 489 489;' xml:space='preserve'%3e%3cg%3e%3cpath d='M440.1,422.7l-28-315.3c-0.6-7-6.5-12.3-13.4-12.3h-57.6C340.3,42.5,297.3,0,244.5,0s-95.8,42.5-96.6,95.1H90.3 c-7,0-12.8,5.3-13.4,12.3l-28,315.3c0,0.4-0.1,0.8-0.1,1.2c0,35.9,32.9,65.1,73.4,65.1h244.6c40.5,0,73.4-29.2,73.4-65.1 C440.2,423.5,440.2,423.1,440.1,422.7z M244.5,27c37.9,0,68.8,30.4,69.6,68.1H174.9C175.7,57.4,206.6,27,244.5,27z M366.8,462 H122.2c-25.4,0-46-16.8-46.4-37.5l26.8-302.3h45.2v41c0,7.5,6,13.5,13.5,13.5s13.5-6,13.5-13.5v-41h139.3v41 c0,7.5,6,13.5,13.5,13.5s13.5-6,13.5-13.5v-41h45.2l26.9,302.3C412.8,445.2,392.1,462,366.8,462z'/%3e%3c/g%3e%3c/svg%3e"
                                width="16"
                                title="Carrinho"
                                className="cart-icon" />
                            <div className="ttu dib">CARRINHO</div>&nbsp;&nbsp;

                            {/* QUANTIDADE DE ITENS */}

                            <div className="item-count">
                                <div className="portal-totalizers-ref">
                                    <div className="amount-items-in-cart">
                                        <div className="cartInfoWrapper">
                                            <span className="title"><span id="MostraTextoXml1">Resumo do Carrinho</span></span>
                                            <ul className="cart-info">
                                                <li className="amount-products">
                                                    <strong><span id="MostraTextoXml2">Total de Produtos:</span></strong> <em id="qtd_carrinho" className="amount-products-em">0</em>
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="menu-item-deco-line"></div>
                        </a>
                    </div>

                    {/* BOTÃO DO MENU (LATERAL) */}

                    <div className="menu-button w-nav-button" onClick={() => { document.getElementById("navmenu").classList.add("open"); } }>
                        <img
                            src="data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' version='1.1' x='0px' y='0px' width='73.168px' height='73.168px' viewBox='0 0 73.168 73.168' style='enable-background:new 0 0 73.168 73.168;' xml:space='preserve'%3e%3cg%3e%3cg id='Navigation'%3e%3cg%3e%3cpath d='M4.242,14.425h64.684c2.344,0,4.242-1.933,4.242-4.324c0-2.385-1.898-4.325-4.242-4.325H4.242 C1.898,5.776,0,7.716,0,10.101C0,12.493,1.898,14.425,4.242,14.425z M68.926,32.259H4.242C1.898,32.259,0,34.2,0,36.584 c0,2.393,1.898,4.325,4.242,4.325h64.684c2.344,0,4.242-1.933,4.242-4.325C73.168,34.2,71.27,32.259,68.926,32.259z M68.926,58.742H4.242C1.898,58.742,0,60.683,0,63.067c0,2.393,1.898,4.325,4.242,4.325h64.684c2.344,0,4.242-1.935,4.242-4.325 C73.168,60.683,71.27,58.742,68.926,58.742z'%3e%3c/path%3e%3c/g%3e%3c/g%3e%3c/g%3e%3c/svg%3e"
                            width="20"
                            title="Menu"
                            className="menu-icon" />
                    </div>
                    <div className="w-nav-overlay"></div>
                </div>
            </header>

            {/* CARRINHO */}

            <div className="basket-wrapper fixed left-0 top-0 w-100 h-100 z-999 closed" id="carrinho">
                <div className="basket__overlay absolute top-0 right-0 w-100 h-100 z-2"></div>
                <div className="basket__wrapper bg-white fr relative overflow-hidden h-100 z-3">
                    <div className="basket__header pa3 tc">
                        <a onClick={() => { document.getElementById("carrinho").classList.add("closed"); } } className="drawer__close"></a>
                        <h2 className="white basket__header--title dib tc ttu">Meu carrinho</h2>
                    </div>
                    <div className="basket__container bg-white">
                        <div className="basket__list bg-white">
                            <div className="basket__empty mv5 mh-auto tc">
                                <span>
                                    <div className="tc">
                                        <span className="ttu fw6 f3">PRODUTOS</span>
                                        <p className="f4 mt4">Confira os seus produtos no carrinho</p>
                                    </div>
                                    <List style={{ width: "100%", bgcolor: "background.paper" }}>
                                        {listaItens}
                                    </List>
                                    <Alert severity="success" id="alertFreteGratis" className="f5" style={{ display: freteGratis, borderRadius: "60px", backgroundColor: "#C7FFA6", color: "#247A03", fontSize: "1.1em", fontFamily: "Poppins" }}>Parabéns, sua compra tem frete grátis!</Alert>
                                </span>
                                <div className="mt4">
                                    <button className="basket_button--empty f4 fw6 pa3 white" style={{ fontSize: "1.1em", cursor: "pointer" }}><span>VOLTAR</span></button>
                                    <button className="basket_button--empty f4 fw6 pa3 white" style={{ backgroundColor: "#198754", fontSize: "1.1em", cursor: "pointer" }}><span>CONFIRMAR</span></button>
                                    <button className="basket_button--empty f4 fw6 pa3 white" style={{ backgroundColor: "#dc3545", fontSize: "1.1em", cursor: "pointer" }}><span>CANCELAR</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN */}

            <main>

                {/* BANNER */}

                <div id="tour" className="full-banner" onClick={() => { document.getElementById("navmenu").classList.remove("open"); } }>
                    <div className="main-content" style={{ backgroundImage: `url(https://thumbs.gfycat.com/ShrillUnevenAfricancivet-size_restricted.gif)`, backgroundRepeat: "no-repeat", backgroundSize: "150%", backgroundPosition: "center" }}>
                        <div className="main-content-text">
                            <h2 className="main-content-title">
                                <span>TECH</span>
                                <span>TOUR</span>
                            </h2>
                            <p className="main-content-sub-title" style={{ lineHeight: "1.4em" }}>No techtour da codeby você é convidado a voar em nossa loja e conhecer nossos produtos</p>
                            <a className="main-content-btn" href="#produtos">COMEÇAR</a>
                        </div>
                    </div>
                </div>

                {/* ------ */}

                <div className="cby-container">
                    <div className="row">
                        <div id="_sl__floating"></div>
                    </div>
                </div>

                {/* PRODUTOS */}<br />

                <h2 id="produtos" className="main-content-title justify-center">
                    <span style={{ fontSize: "1.5em" }}>LANÇAMENTOS</span>
                </h2>

                <div className="cby-container books">
                    <div className="row">
                        {listarProdutos()}
                    </div>
                </div>

                {/* ------ */}

                <div className="cby-container">
                    <div className="row">
                        <div id="sl-shelfhover-container"></div>
                    </div>
                </div><br />
            </main>

            {/* FOOTER */}

            <footer className="mt2 flex flex-column">
                <section className="__f-newsletter-section bt-0 bg-black pv4">
                    <div className="mw8 flex flex-wrap justify-center items-center center">

                        {/* ENVIO DE EMAIL */}

                        <form onSubmit={(e) => { e.preventDefault(); } } className="w-100 w-50-l" style={{ padding: "2% 4%" }} id="__f-news">
                            <fieldset>
                                <span className="flex flex-column items-center flex-wrap justify-center">
                                    <h4 className="tc tl-ns ttu f4 fw6 ma0 mb4 white f5-l fw7-l mb3-l w-100">Fique por dentro das novidades</h4>
                                    <div className="flex flex-row items-center flex-wrap justify-between w-100">
                                        <span className="w-65 h3"><input className="__f-news-email black pa2 pl3 fw7 f6 ba b--mid-gray w-100 h-100" type="email" id="__f-news-email" placeholder="Digite seu Email" /></span>
                                        <button className="__f-news-send white bg--sh-light-gray f6 fw7 h3 ttu pointer pv2 ph4 lh-copy b--none w-30 bg-light-gray-l fw6-l" type="submit" id="__f-news-send">
                                            <span className="dn-l">Enviar</span><span className="dn dib-l">Assinar</span>
                                        </button>
                                    </div>
                                </span>
                            </fieldset>
                        </form>

                        {/* SIGA A GENTE */}

                        <div className="__f-social-section w-100 mt3 mt0-ns ml6-l w-30-l tc tl-ns hidden-xs">
                            <h4 className="mt0 mb3 ttu f5 fw7 white">Siga a Gente!</h4>
                            <ul className="flex flex-row flex-wrap justify-center justify-start-ns items-center">
                                <li className="_social-flags pb1 tc mr2">
                                    <a target="_blank" href="https://www.linkedin.com/in/mateus-silva-3b054421a/">
                                        <img
                                            className="_f-i db center mw2 w-100"
                                            src="https://cdn-icons-png.flaticon.com/512/145/145807.png"
                                            title="Linkedin" />
                                    </a>
                                </li>
                                <li className="_social-flags pb1 tc mr2">
                                    <a target="_blank" href="https://www.youtube.com/channel/UCVTmUO_kCcSSo5i5ugvojOg">
                                        <img
                                            className="_f-i db center mw2 w-100"
                                            src="https://www.youtube.com/s/desktop/f9ccd8c6/img/favicon_144x144.png"
                                            title="YouTube" />
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
                <div className="__f-aboutus-section bg-light-gray">

                    {/* RODAPÉ */}

                    <section className="pv4">
                        <div className="cby-container">
                            <div className="row">
                                <div className="center flex flex-column flex-row-l flex-wrap justify-around mw-980-l">

                                    {/* INSTITUCIONAL */}

                                    <div className="__f-column tc tl-l accordion">
                                        <input className="accordion-input dn" type="checkbox" id="institucional" name="institucional" />
                                        <label htmlFor="institucional" className="db pb3 ttu f4 f6-l fw6 fw7-l almost-black color-6f-l accordion-title">Institucional</label>
                                        <ul className="accordion-content">
                                            <li className="pb3 pb2-l"><a className="ttu f5 f6-l color-6f" href="#">Quem somos</a></li>
                                            <li className="pb3 pb2-l"><a className="ttu f5 f6-l color-6f" href="#">Nossas Lojas</a></li>
                                        </ul>
                                    </div>
                                    <div className="__f-column __f-v_divider hidden-xs" style={{ width: "1px", backgroundColor: "#d8d8d8" }}></div>

                                    {/* ATENDIMENTO */}

                                    <div className="__f-column mb4 mb0-l tc tl-l accordion">
                                        <input className="accordion-input dn" type="checkbox" id="atendimento" name="atendimento" />
                                        <label htmlFor="atendimento" className="db pb3 ttu f4 f6-l fw6 fw7-l almost-black color-6f-l accordion-title">Atendimento</label>
                                        <ul className="accordion-content">
                                            <li className="pb3 pb2-l"><a className="ttu f5 f6-l color-6f" href="#">Central de Atendimento</a></li>
                                            <li className="pb3 pb2-l"><a className="ttu f5 f6-l color-6f" href="#">Trocas e Devoluções</a></li>
                                            <li className="pb3 pb2-l"><a className="ttu f5 f6-l color-6f" href="#">Política de Privacidade</a></li>
                                        </ul>
                                    </div>

                                    {/* SIGA A GENTE */}

                                    <div className="__f-column tc pb4 dn-l bb b--sh-moon-gray pb0-l bb-0-l">
                                        <h4 className="mt0 mb4 ttu f3 fw6 fw7-l black">Siga a Gente!</h4>
                                        <ul className="center flex flex-row flex-wrap justify-center">
                                            <li className="_social-flags pb1 tc mh3">
                                                <a target="_blank" href="https://www.linkedin.com/in/mateus-silva-3b054421a/">
                                                    <img
                                                        className="_f-i db center mw2 w-100"
                                                        src="https://cdn-icons-png.flaticon.com/512/145/145807.png"
                                                        title="Linkedin" />
                                                </a>
                                            </li>
                                            <li className="_social-flags pb1 tc mh3">
                                                <a target="_blank" href="https://www.youtube.com/channel/UCVTmUO_kCcSSo5i5ugvojOg">
                                                    <img
                                                        className="_f-i db center mw2 w-100"
                                                        src="https://www.youtube.com/s/desktop/f9ccd8c6/img/favicon_144x144.png"
                                                        title="YouTube" />
                                                </a>
                                            </li>

                                        </ul>
                                    </div>
                                    <div className="__f-column __f-v_divider hidden-xs" style={{ width: "1px", backgroundColor: "#d8d8d8" }}></div>

                                    {/* DISTRIBUIÇÃO */}

                                    <div className="__f-column bb b--sh-moon-gray pv4 pv0-l bb-0-l tc tl-l hidden-xs">
                                        <ul className="_cby_f__social">
                                            <li className="mt3 ttu f6 fw6 color-6f hidden-xs">Powered by</li><br />
                                            <li className="_vtex hidden-xs">
                                                M. S.
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* COPYRIGHT */}

                    <section className="pb4 pv3-l">
                        <div className="cby-container">
                            <div className="row">
                                <div className="center flex flex-row flex-wrap justify-center">
                                    <div className="w-100 mw-980-l">
                                        <p className="color-6f ttu f6 tc mb1 f7-l lh-2-l">© 2019, Codeby | Tecnologia para negócios Powered by <a href="https://www.vtex.com.br">Vtex</a></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </footer>
        </div>
    )
}
