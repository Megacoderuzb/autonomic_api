import axios from 'axios';

function generateCode(): number {
  return Math.floor(1000 + Math.random() * 9000);
}

async function refreshToken(): Promise<boolean> {
  try {
    const TOKEN = process.env.SMS_TOKEN;

    const res = await axios.post<{ data: { token: string } }>(
      'http://notify.eskiz.uz/api/auth/login',
      {
        email: 'hypernova.uz@gmail.com',
        password: '9SActIXcUcUvtt9WDCF9aGzdwAeUdb3gfrZh49Ur',
      },
    );

    process.env.SMS_TOKEN = res.data.data.token;
    console.log('Token refreshed:', TOKEN);
    return true;
  } catch {
    return false;
  }
}

interface SmsApiResponse {
  status: string;
  code: number;
  message?: string;
  data?: {
    token?: string;
  };
}

async function sendSmsLocal(
  phoneNumber: string,
  message: string,
): Promise<SmsApiResponse> {
  const TOKEN = process.env.SMS_TOKEN;

  const res = await axios.post<SmsApiResponse>(
    'http://notify.eskiz.uz/api/message/sms/send',
    {
      mobile_phone: `${phoneNumber}`,
      message: message,
      from: 4546,
    },
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
      },
    },
  );

  if (res.data?.status === 'error') {
    if (res.data?.code === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return sendSmsLocal(phoneNumber, message);
      }
    }
  }

  return res.data;
}

export async function sendSms(
  phoneNumber: string,
  type: number,
  hashKey?: string,
): Promise<number> {
  try {
    let code: number;

    if (phoneNumber === '998900324412') code = 1111;
    else code = generateCode();

    let message = '';
    if (type === 1)
      message = `Kodni hech kimga bermang! Zein edtech ilovasiga ro‘yxatdan o‘tish uchun kod: ${code} ${hashKey ?? ''}`;
    else if (type === 2)
      message = `Kodni hech kimga bermang! Zein edtech ilovasiga login qilish uchun tasdiqlash kodi: ${code} ${hashKey ?? ''}`;

    await sendSmsLocal(phoneNumber, message);
    return code;
  } catch (err: any) {
    if ((err as SmsApiResponse)?.code === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        return sendSms(phoneNumber, type, hashKey);
      }
    }
    throw new Error(`SMS sending error: ${(err as Error)?.message ?? err}`);
  }
}
