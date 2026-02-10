const axios = require('axios');
const crypto = require('crypto');
const cheerio = require('cheerio');
const sizeOf = ("image-size");
async function Mail() {
  try {
    const data = JSON.stringify({});
    const config = {
      method: 'POST',
      url: 'https://tempmail.la/api/mail/create',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
      },
      data
    };
    const r = await axios.request(config);
    return r.data.data.address;
  } catch (err) {
    return Mail();
  }
}

async function MailBox(mail) {
  try {
    const data = JSON.stringify({ address: mail, cursor: null });
    const config = {
      method: 'POST',
      url: 'https://tempmail.la/api/mail/box',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
        'sec-ch-ua-mobile': '?0',
        'product': 'TEMP_MAIL',
        'locale': 'en-US',
        'platform': 'PC',
        'sec-gpc': '1',
        'accept-language': 'en;q=0.7',
        'origin': 'https://tempmail.la',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        'referer': 'https://tempmail.la/temporary-email',
        'priority': 'u=1, i'
      },
      data
    };
    const r = await axios.request(config);
    return r.data.data.rows;
  } catch (err) {
    return MailBox(mail);
  }
}

async function signUser(username, email) {
  let data = JSON.stringify([{
    email: email,
    userName: username,
    password: username + username
  }]);

  let config = {
    method: 'POST',
    url: 'https://fluxproweb.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'text/plain;charset=UTF-8',
      'sec-ch-ua-platform': '"Windows"',
      'next-action': '424401cbe4e8b1b79045e4ac3dcf3d788c2156dd',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.9',
      'origin': 'https://fluxproweb.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://fluxproweb.com/',
      'priority': 'u=1, i'
    },
    data: data
  };

  try {
    let response = await axios.request(config);
    return response.data;
  } catch (err) {
    throw err;
  }
}
async function verifyUser(username, code, email) {
  let data = JSON.stringify([{
    email: email,
    emailCode: code
  }]);

  let config = {
    method: 'POST',
    url: 'https://fluxproweb.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'text/plain;charset=UTF-8',
      'sec-ch-ua-platform': '"Windows"',
      'next-action': 'efbaa6169049c8cb5fd4fd1abe810d880738ab19',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.9',
      'origin': 'https://fluxproweb.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://fluxproweb.com/',
      'priority': 'u=1, i'
    },
    data: data
  };

  try {
    let response = await axios.request(config);
    return response.data;
  } catch (err) {
    throw err;
  }
}
async function loginUser(username, email) {
  let data = JSON.stringify([{
    email: email,
    password: username + username
  }]);

  let config = {
    method: 'POST',
    url: 'https://fluxproweb.com',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Accept': 'text/x-component',
      'Accept-Encoding': 'gzip, deflate, br, zstd',
      'Content-Type': 'text/plain;charset=UTF-8',
      'sec-ch-ua-platform': '"Windows"',
      'next-action': '1c7778f900ce2db3f2c455a90e709ef29ae30db3',
      'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
      'sec-ch-ua-mobile': '?0',
      'sec-gpc': '1',
      'accept-language': 'en;q=0.9',
      'origin': 'https://fluxproweb.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'referer': 'https://fluxproweb.com/',
      'priority': 'u=1, i'
    },
    data: data,
    withCredentials: true,
    maxRedirects: 0
  };

  try {
    let response = await axios.request(config);
    let cookies = response.headers["set-cookie"];
    if (!cookies || !cookies[0]) {
      throw new Error("Login failed: No cookies returned");
    }
    return cookies[0];
  } catch (err) {
    if (err.response?.headers?.["set-cookie"]) {
      const cookie = err.response.headers["set-cookie"][0];
      if (!cookie) {
        throw new Error("Login failed: Empty cookie");
      }
      return cookie;
    }
    throw new Error("Login failed: " + err.message);
  }
}

async function getPresignedUrl(token, length = 1) {
  const response = await axios.request({
    method: 'POST',
    url: 'https://api2.tap4.ai/image/presignedUrl',
    headers: {
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    data: {
      site: "fluxproweb.com",
      mineType: Array(length).fill("image/jpeg")
    },
    responseType: 'json',
    decompress: true
  });
  return response.data;
}
async function uploadImages(urls, buffers) {
  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const config = {
      method: 'PUT',
      url: urls[i].signedUrl,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'Accept-Encoding': 'gzip, deflate, br, zstd',
        'Content-Type': 'image/jpeg',
        'sec-ch-ua-platform': '"Windows"',
        'sec-ch-ua': '"Chromium";v="140", "Not=A?Brand";v="24", "Brave";v="140"',
        'sec-ch-ua-mobile': '?0',
        'Sec-GPC': '1',
        'Accept-Language': 'en;q=0.9',
        'Origin': 'https://fluxproweb.com',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Dest': 'empty',
        'Referer': 'https://fluxproweb.com/'
      },
      data: buffers[i]
    };
    try {
      const response = await axios.request(config);
      results.push(urls[i].url);
    } catch (err) {
      console.log("err")
    }
  }
  return results;
}

async function generateImage(prompt, imageUrl, token, width = 1, height = 1) {
  const response = await axios.request({
    method: 'POST',
    url: 'https://api2.tap4.ai/image/generator4login/async',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`
    },
    data: {
      site: "fluxproweb.com",
      prompt: prompt,
      outputPrompt: prompt,
      platformType: 27,
      modelName: "gemini-25-flash-image-edit",
      aiEnhance: false,
      width: width,
      height: height,
      styleName: "",
      isPublic: 1,
      imageType: "nano-banana-image",
      imageUrlList: imageUrl
    },
    responseType: 'json',
    decompress: true
  });
  return response.data;
}

async function seeDreamEdit(prompt, imageUrl, token, width = 16, height = 9) {
  const response = await axios.request({
    method: "POST",
    url: "https://api2.tap4.ai/image/generator4login/async",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    data: {
      site: "fluxproweb.com",
      imageType: "seedream-4-0",
      platformType: 44,
      modelName: "seedream-v4-edit",
      isPublic: 1,
      prompt: prompt,
      outputPrompt: prompt,
      width: width,
      height: height,
      resolution: "4k",
      imageUrlList: imageUrl,
    },
    responseType: "json",
    decompress: true,
  });
  return response.data;
}

async function seeDreamGen(prompt, token, width = 16, height = 9) {
  const response = await axios.request({
    method: "POST",
    url: "https://api2.tap4.ai/image/generator4login/async",
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    data: {
      site: "fluxproweb.com",
      imageType: "seedream-4-0",
      platformType: 44,
      modelName: "seedream-v4",
      isPublic: 1,
      prompt: prompt,
      outputPrompt: prompt,
      width: width,
      height: height,
      resolution: "4k",
    },
    responseType: "json",
    decompress: true,
  });
  return response.data;
}

async function waitForImageResult(taskID, token, interval = 2000) {
  const url = `https://api2.tap4.ai/image/getResult/${taskID}?site=fluxproweb.com`;

  while (true) {
    const response = await axios.request({
      method: 'GET',
      url: url,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        'authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      responseType: 'json',
      decompress: true
    });

    const result = response.data;

    if (!result.data || result.data.status == "success") {
      return result;
    }

    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

async function toBuffer(urls) {
  const buffers = [];
  for (let i = 0; i < urls.length; i++) {
    const response = await axios.get(urls[i], { responseType: 'arraybuffer' });
    buffers.push(Buffer.from(response.data));
  }
  return buffers;
}

async function NanoBanana(prompt, imageUrls, width, height) {
  const username = crypto.randomBytes(6).toString("hex");
  const email = await Mail();
  await signUser(username, email);
  let mail = await MailBox(email);
  let code;
  while (true) {
    mail = await MailBox(email);
    if (mail.length != 0) {
      const match = cheerio.load(mail[0].html)('a').first().text().trim();
      if (match) {
        code = match;
        break;
      } else {
        console.log("No code found");
        break;
      }
    }
  }
  await verifyUser(username, code, email);
  let cookie = await loginUser(username, email);
  const decodedCookie = decodeURIComponent(cookie);

  const tokenMatch = decodedCookie?.match(
    /Authorization=(?:Bearer\s+)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/
  );
  if (!tokenMatch) {
    throw new Error("Failed to extract token from cookie");
  }
  const token = tokenMatch[1];
  const presigned = await getPresignedUrl(token);
  const urls = await uploadImages(
    presigned.rows,
    await toBuffer([
      imageUrls
    ])
  );
  const task = await generateImage(prompt, urls, token, width, height);
  const result = await waitForImageResult(task.data.key, token);
  return result.data.imageResponseVo;
}

class SeaDream {
  constructor() {
    this.Ratios = ["21:9", "16:9", "4:3", "3:2", "1:1", "2:3", "3:4", "9:16", "9:21"];
  }

  ParseRatio(r) {
    const [w, h] = r.split(":").map(Number);
    return w / h;
  }

  RASS(length = 14) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
    return Array.from(
      { length },
      () => chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  }

  async MakeMail() {
    const password = this.RASS();
    const domainsRes = await axios.get("https://api.mail.tm/domains");
    const domains = domainsRes.data["hydra:member"]
      .filter(d => d.isActive)
      .map(d => d.domain);

    if (!domains.length) {
      throw new Error("No active domains found");
    }

    const randomString = Math.random().toString(36).substring(2, 10);
    const address = `${randomString}@${domains[0]}`;

    await axios.post(
      "https://api.mail.tm/accounts",
      { address, password },
      { headers: { "Content-Type": "application/json" } }
    );

    const tokenRes = await axios.post(
      "https://api.mail.tm/token",
      { address, password },
      { headers: { "Content-Type": "application/json" } }
    );

    return {
      address,
      password,
      token: tokenRes.data.token
    };
  }

  async GetMails(token, delay = 3000) {
    const regex = /Security code:\s*(\d+)/;

    while (true) {
      const res = await axios.get("https://api.mail.tm/messages", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const messages = res.data["hydra:member"];

      if (messages && messages.length > 0) {
        for (const msg of messages) {
          if (msg.intro) {
            const match = msg.intro.match(regex);
            if (match) {
              return match[1];
            }
          }
        }
      }

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  GetNearest(width, height) {
    const actual = width / height;
    let best = this.Ratios[0];
    let diff = Math.abs(actual - this.ParseRatio(best));
    for (const r of this.Ratios) {
      const d = Math.abs(actual - this.ParseRatio(r));
      if (d < diff) {
        best = r;
        diff = d;
      }
    }
    return best.split(":").map(Number);
  }

  async SignUser(Email, Username, Password) {
    const Data = JSON.stringify([
      {
        email: Email,
        userName: Username,
        password: Password,
      },
    ]);
    const Config = {
      method: "POST",
      url: "https://fluxproweb.com",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "Content-Type": "text/plain;charset=UTF-8",
        "next-action": "424401cbe4e8b1b79045e4ac3dcf3d788c2156dd",
      },
      data: Data,
    };
    const Response = await axios.request(Config);
    return Response.data;
  }

  async VerifyUser(Email, Code) {
    const Data = JSON.stringify([
      {
        email: Email,
        emailCode: Code,
      },
    ]);
    const Config = {
      method: "POST",
      url: "https://fluxproweb.com",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "Content-Type": "text/plain;charset=UTF-8",
        "next-action": "efbaa6169049c8cb5fd4fd1abe810d880738ab19",
      },
      data: Data,
    };
    const Response = await axios.request(Config);
    return Response.data;
  }

  async LoginUser(Email, Password) {
    const Data = JSON.stringify([
      {
        email: Email,
        password: Password,
      },
    ]);
    const Config = {
      method: "POST",
      url: "https://fluxproweb.com",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
        "Content-Type": "text/plain;charset=UTF-8",
        "next-action": "1c7778f900ce2db3f2c455a90e709ef29ae30db3",
      },
      data: Data,
      withCredentials: true,
      maxRedirects: 0,
    };
    const Response = await axios.request(Config);
    const Cookies = Response.headers["set-cookie"] || [];
    const cookieStr = Array.isArray(Cookies) ? Cookies.join("; ") : (Cookies || "");
    return cookieStr;
  }

  async GetPresignedUrl(Token, Length = 1) {
    const Response = await axios.request({
      method: "POST",
      url: "https://api2.tap4.ai/image/presignedUrl",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${Token}`,
      },
      data: {
        site: "fluxproweb.com",
        mineType: Array(Length).fill("image/jpeg"),
      },
    });
    return Response.data;
  }

  async UploadImages(Urls, Buffers) {
    const Results = [];
    for (let I = 0; I < Urls.length; I++) {
      try {
        await axios.put(Urls[I].signedUrl, Buffers[I], {
          headers: { "Content-Type": "image/jpeg" },
        });
        Results.push(Urls[I].url);
      } catch {}
    }
    return Results;
  }

  async ToBuffer(Urls) {
    const Buffers = [];
    for (let I = 0; I < Urls.length; I++) {
      const Response = await axios.get(Urls[I], {
        responseType: "arraybuffer",
      });
      Buffers.push(Buffer.from(Response.data));
    }
    return Buffers;
  }

  async WaitForImageResult(TaskID, Token, Interval = 2000) {
    const Url = `https://api2.tap4.ai/image/getResult/${TaskID}?site=fluxproweb.com`;
    while (true) {
      const Response = await axios.get(Url, {
        headers: { authorization: `Bearer ${Token}` },
      });
      const Result = Response.data;
      if (!Result.data || Result.data.status === "success") {
        return Result;
      }
      await new Promise((R) => setTimeout(R, Interval));
    }
  }

  async SeeDreamEdit(Prompt, ImageUrl, Token, Width, Height) {
    const Response = await axios.post(
      "https://api2.tap4.ai/image/generator4login/async",
      {
        site: "fluxproweb.com",
        imageType: "seedream-4-0",
        platformType: 44,
        modelName: "seedream-v4-edit",
        isPublic: 1,
        prompt: Prompt,
        outputPrompt: Prompt,
        width: Width,
        height: Height,
        resolution: "4k",
        imageUrlList: ImageUrl,
      },
      { headers: { authorization: `Bearer ${Token}` } }
    );
    return Response.data;
  }

  async SeeDreamGen(Prompt, Token, Width, Height) {
    const Response = await axios.post(
      "https://api2.tap4.ai/image/generator4login/async",
      {
        site: "fluxproweb.com",
        imageType: "seedream-4-0",
        platformType: 44,
        modelName: "seedream-v4",
        isPublic: 1,
        prompt: Prompt,
        outputPrompt: Prompt,
        width: Width,
        height: Height,
        resolution: "4k",
      },
      { headers: { authorization: `Bearer ${Token}` } }
    );
    return Response.data;
  }

  async GetTokenFromAuthFlow() {
    const Username = crypto.randomBytes(8).toString("hex");
    const Password = this.RASS();
    const Email = await this.MakeMail();

    await this.SignUser(Email.address, Username, Password);
    const Code = await this.GetMails(Email.token);
    await this.VerifyUser(Email.address, Code);

    const Cookie = await this.LoginUser(Email.address, Password);
    const decodedCookie = Cookie ? decodeURIComponent(Cookie) : "";
    const match = decodedCookie.match(/Authorization=(?:Bearer\s*)?([A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+)/);
    
    if (!match) {
      throw new Error(`Authorization token not found in cookie`);
    }
    return match[1];
  }

  async Edit(Prompt, Images) {
    const ImageUrls = Array.isArray(Images) ? Images : [Images];
    const Token = await this.GetTokenFromAuthFlow();
    const Buffers = await this.ToBuffer(ImageUrls);
    const dimensions = sizeOf(Buffers[0]);
    const [Width, Height] = this.GetNearest(dimensions.width, dimensions.height);
    
    const Presigned = await this.GetPresignedUrl(Token, ImageUrls.length);
    const Urls = await this.UploadImages(Presigned.rows, Buffers);
    
    const Task = await this.SeeDreamEdit(Prompt, Urls, Token, Width, Height);
    const Result = await this.WaitForImageResult(Task.data.key, Token);
    return Result.data.imageResponseVo;
  }

  async Gen(Prompt, Width = 16, Height = 9) {
    const Token = await this.GetTokenFromAuthFlow();
    const Task = await this.SeeDreamGen(Prompt, Token, Width, Height);
    const Result = await this.WaitForImageResult(Task.data.key, Token);
    return Result.data.imageResponseVo;
  }
}


module.exports = {
  NanoBanana,
  SeaDream
}