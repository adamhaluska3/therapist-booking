"use client"

import { deletePost } from "@/server/blog/mutations"
import { Trash2 } from "lucide-react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";

export const RemovePostDialog = ({id, title}: {id: string, title?: string}) => {
    const [open, setOpen] = useState(false)
    return (
        <>
            <Trash2 className='text-red-900 hover:cursor-pointer' onClick={() => setOpen(true)}/>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                    <DialogTitle>Vymazať príspevok</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-2">
                        <p>
                            Pokúšate sa vymazať príspevok: {title}<br/>
                            Ste si istý, že chcete pokračovať?
                            Táto akcia je trvalá.
                        </p>
                        <br/>
                        <p>Keď chcete príspevok iba skryť pre klientov, označte ho ako <b>Koncpet</b></p>
                    </div>

                    <DialogFooter>
                        <DialogClose render={<Button variant="outline" />}>
                            Zrušiť
                        </DialogClose>
                        <Button className="bg-red-700" onClick={() => {deletePost(id); setOpen(false)}}>
                            Vymazať
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}