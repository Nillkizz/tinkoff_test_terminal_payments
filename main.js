document.getElementById("PayForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const $payLink = document.getElementById("PayLink");
  const $logAreaRequest = document.getElementById("LogAreaRequest");
  const $logAreaResponse = document.getElementById("LogAreaResponse");

  $payLink.innerHTML = "";
  $logAreaRequest.value = "";
  $logAreaResponse.value = "";

  const url = "https://securepay.tinkoff.ru/v2/Init";

  function getVal(id) {
    return document.getElementById(id).value;
  }

  const term_key = getVal("term_key"),
    term_password = getVal("term_password"),
    amount = getVal("amount"),
    phone = getVal("phone"),
    email = getVal("email"),
    order_id = getVal("order_id");

  const req_body = {
    TerminalKey: term_key,
    Amount: amount,
    OrderId: order_id,
    Receipt: {
      Phone: phone,
      Email: email,
      Taxation: "osn",
      Items: [
        {
          Name: "Наименование товара",
          Price: amount,
          Quantity: 1.0,
          Amount: amount,
          PaymentMethod: "full_prepayment",
          PaymentObject: "commodity",
          Tax: "vat10",
          Ean13: "0123456789",
        },
      ],
    },
  };

  req_body.Token = makeToken(term_password, req_body);

  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json;charset=utf-8",
    },
    body: JSON.stringify(req_body),
  })
    .then((res) => res.json())
    .then((res) => {
      $logAreaRequest.value = JSON.stringify(req_body, null, 2);
      if (!res.Success) {
        $logAreaResponse.value = JSON.stringify(res, null, 2);
        return;
      }

      $logAreaResponse.value = JSON.stringify(res, null, 2);
      const paymentURL = res.PaymentURL;
      const payLink = document.createElement("a");
      payLink.id = "PayLink";
      payLink.innerHTML = "Перейти на страницу оплаты";
      payLink.href = paymentURL;

      $payLink.appendChild(payLink);
    });

  function makeToken(password, params) {
    const toSign = Object.entries(
      only(params, "TerminalKey", "Amount", "OrderId", "Description")
    );
    toSign.push(["Password", password]);
    toSign.sort((a, b) => a[0].localeCompare(b[0]));
    return sha256(toSign.map(([_, value]) => value).join(""));
  }
  function only(obj, ...keys) {
    // Return copy of object with only specified keys
    const copy = { ...obj };
    Object.keys(copy).forEach((key) => {
      if (!keys.includes(key)) delete copy[key];
    });
    return copy;
  }
});
