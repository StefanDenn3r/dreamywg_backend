import * as bcrypt from "bcrypt"
import { NextFunction, Request, Response } from "express"
import * as halson from "halson"
import * as jwt from "jsonwebtoken"
import FlatOfferer, {
     default as flatOfferer,
     IOffererModel
} from "./flatOfferer"
import { APILogger } from "../utils/logger"
import { formatOutput, formatUser } from "../utils"
import Token, { ITokenModel } from "../tokens/token"

//TODO add try catch to every await
export let getUsers = async (
     req: Request,
     res: Response,
     next: NextFunction
) => {
     let flatSeeker = await flatOfferer.find()
     if (!flatSeeker) {
          APILogger.logger.info(`[GET] [/users] something went wrong`)
          return res.status(404).send()
     }

     return formatOutput(res, flatSeeker.map(formatUser), 200, "flatofferer")
}

export let getUser = async (
     req: Request,
     res: Response,
     next: NextFunction
) => {
     const id = req.params.id

     APILogger.logger.info(`[GET] [/flatofferer] ${id}`)

     let flatofferer = await flatOfferer.findById(id)
     if (!flatofferer) {
          APILogger.logger.info(
               `[GET] [/flatofferer/:{id}] flatofferer with id ${id} not found`
          )
          return res.status(404).send()
     }
     return formatOutput(res, formatUser(flatofferer), 200, "flatofferer")
}

export let addUser = (req: Request, res: Response, next: NextFunction) => {
     const newOfferer = new flatOfferer(req.body)

     return newOfferer.save((error, user) => {
          if (error) {
               APILogger.logger.error(
                    `[POST] [/users] something went wrong when saving a new flatofferer ${newOfferer} | ${
                         error.message
                    }`
               )
               return res.status(500).send(error)
          }
          user = halson(user.toJSON()).addLink(
               "self",
               `/flatofferer/${newOfferer._id}`
          )
          return formatOutput(res, user, 201, "flatofferer")
     })
}

export let updateUser = async (
     req: Request,
     res: Response,
     next: NextFunction
) => {
     const id = req.params.id

     APILogger.logger.info(`[PATCH] [/flatofferer] ${id}`)

     let oferrer: IOffererModel = await flatOfferer.findById(id)

     if (!oferrer) {
          APILogger.logger.info(
               `[PATCH] [/flatofferer/:{id}] flatofferer with id ${id} not found`
          )
          return res.status(404).send()
     }

     return oferrer.save(() => res.status(204).send())
}

export let removeUser = async (
     req: Request,
     res: Response,
     next: NextFunction
) => {
     const id = req.params.id

     APILogger.logger.warn(`[DELETE] [/flatofferer] ${id}`)

     let oferrer = await FlatOfferer.findById(id)
     if (!oferrer) {
          APILogger.logger.info(
               `[DELETE] [/flatofferer/:{id}] flatofferer with id ${id} not found`
          )
          return res.status(404).send()
     }

     return oferrer.remove(() => res.status(204).send())
}
