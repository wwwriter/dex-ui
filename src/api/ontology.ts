import { ontologyApi } from "./dexApi";
import { Ontology } from "../types";

export const getOntologies = async (): Promise<Ontology[]> => {
  return ontologyApi.getAll();
};

export const createOntology = async (data: {
  name: string;
  description: string;
}): Promise<Ontology> => {
  return ontologyApi.create(data);
};
