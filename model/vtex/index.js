

export default function VTEX() {
    const props = {};

    const req = axios.create({ headers: { Accept: 'application/json' }});

    const produtos = function () {
        return req.get("https://vtexstore.codeby.com.br/api/catalog_system/pub/products/search/");
    }

    const get = async function (url) {
        return req.get(url).then((response) => response.data);
    }

    props.get = get;
    props.produtos = produtos;

    return props;
}