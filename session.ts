import {NextFunction, Request, Response} from "express";
import {supabase} from "../provider/supabase";

export const session = async (req: Request, res: Response, next: NextFunction) => {
    const sessionToken = req.headers['x-access-token'] as string;
    const refreshToken = req.headers['x-refresh-token'] as string;

    if(!sessionToken) {
        return res.status(401).json({
            error: "No session token provided"
        })
    }

    const {data: session, error: sessionError} = await supabase.auth.setSession({
        access_token: sessionToken,
        refresh_token: refreshToken,
    });

    if(sessionError) {
        return res.status(401).json({
            error: "Invalid session token"
        })
    }

    // @ts-ignore
    req.user = session?.user;

    next();
}