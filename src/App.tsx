import React, { useState } from "react";
import styled from "styled-components";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { QuoteFuncParams, QuoteListParams, QuoteType } from "../types";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button } from "react-bootstrap";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faX } from "@fortawesome/free-solid-svg-icons";
import MyNavbar from "./Components/MyNavbar";

const initial = Array.from({ length: 0 }, (v, k) => k).map((k) => {
  const custom: QuoteType = {
    id: `id-${k}`,
    content: `Quote ${k}`,
  };

  return custom;
});

const grid = 8;
const reorder = (list: QuoteType[], startIndex: number, endIndex: number) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const QuoteItem = styled.div`
  width: 85%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); /* Hafif bir gölge */
  transition: box-shadow 0.3s ease-in-out; /* Hover efektine yumuşak geçiş */
  border-radius: 5px;
  margin-bottom: ${grid}px;
  background-color: white;
  padding: ${grid}px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

function Quote({ quote, index, deleteFunction, col }: QuoteFuncParams) {
  return (
    <Draggable draggableId={quote.id} index={index}>
      {(provided) => (
        <QuoteItem
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {quote.content}{" "}
          <FontAwesomeIcon
            icon={faX}
            onClick={(e) => {
              e.stopPropagation(); // Drag olayını engeller
              deleteFunction(quote, col);
            }}
            style={{ cursor: "pointer" }} // fare imleci el şeklinde olur
          />
        </QuoteItem>
      )}
    </Draggable>
  );
}

const QuoteList = React.memo(function QuoteList({
  quotes,
  deleteFunction,
  col,
}: QuoteListParams) {
  return quotes.map((quote: QuoteType, index: number) => (
    <Quote
      quote={quote}
      index={index}
      key={quote.id}
      deleteFunction={deleteFunction}
      col={col}
    />
  ));
});

export default function QuoteApp() {
  const [state, setState] = useState(initial);
  const [inputValue, setInputValue] = useState("");
  const [inProgress, setInProgress] = useState<QuoteType[]>([]);
  const [done, setDone] = useState<QuoteType[]>([]);
  type columnId = "State" | "InProgress" | "Done";
  function getColumn(id: columnId): QuoteType[] {
    if (id === "State") return state;
    if (id === "InProgress") return inProgress;
    if (id === "Done") return done;
    throw new Error(`Invalid column id: ${id}`);
  }

  function getSetColumn(id: columnId) {
    if (id === "State") return setState;
    if (id === "InProgress") return setInProgress;
    if (id === "Done") return setDone;

    throw new Error(`Invalid column id: ${id}`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function onDragEnd(result: any) {
    const { source, destination } = result;
    if (!destination) {
      return;
    }
    /* 
    if (destination.index === source.index) {
      return;
    }

    const quotes = reorder(state, source.index, destination.index);

    setState(quotes); */
    //Aynı sütun içerisinde taşıma
    if (source.droppableId === destination.droppableId) {
      const column: QuoteType[] = getColumn(source.droppableId);
      const setColumn = getSetColumn(source.droppableId);

      const reordered = reorder(column, source.index, destination.index);
      setColumn(reordered);
    } else {
      // Farklı sütuna taşıma
      const sourceList = getColumn(source.droppableId);
      const destList = getColumn(destination.droppableId);

      const setSourceList = getSetColumn(source.droppableId);
      const setDestList = getSetColumn(destination.droppableId);

      const sourceClone = [...sourceList];
      const destClone = [...destList];

      const [movedItem] = sourceClone.splice(source.index, 1); //ilk dokunduğumuz yerden çıkar
      destClone.splice(destination.index, 0, movedItem); //bıraktığımız yere ekle

      setSourceList(sourceClone); //ilk dokunduğumuz yerin state'ini güncelle
      setDestList(destClone); //bıraktığımız yerin state'ini güncelle
    }
  }
  function deleteQuote(quote: QuoteType, col: string): void {
    if (col == "State") {
      const newState = state.filter((q) => q.id !== quote.id);
      setState(newState);
    }
    if (col == "InProgress") {
      const newState = inProgress.filter((q) => q.id !== quote.id);
      setInProgress(newState);
    }
    if (col == "Done") {
      const newState = done.filter((q) => q.id !== quote.id);
      setDone(newState);
    }
  }
  function addQuote(inputValue: string): void {
    // eslint-disable-next-line no-extra-boolean-cast
    if (!!inputValue) {
      const idNumbers = state.map((q) => parseInt(q.id.replace("id-", ""), 10));
      const maxIdNumber = idNumbers.length > 0 ? Math.max(...idNumbers) : -1;
      const newId = `id-${maxIdNumber + 1}`;
      setState([...state, { id: newId, content: inputValue }]);
      setInputValue("");
    }
  }
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key == "Enter") {
      addQuote(inputValue);
    }
  }

  return (
    <>
      <MyNavbar>
        <div className="input-group" style={{ maxWidth: "600px" }}>
          <input
            className="form-control"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bugün..."
          ></input>
          <Button variant="warning" onClick={() => addQuote(inputValue)}>
            Yeni Görev Ekle
          </Button>
        </div>
      </MyNavbar>
      <DragDropContext onDragEnd={onDragEnd}>
        <Container>
          <Row className="text-center">
            <Col xs={12} md={4}>
              <Droppable droppableId="State">
                {(provided) => (
                  <div
                    className="yukseklik"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h2>YAPILACAK</h2>
                    <QuoteList
                      quotes={state}
                      deleteFunction={deleteQuote}
                      col="State"
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
            <Col xs={12} md={4}>
              <Droppable droppableId="InProgress">
                {(provided) => (
                  <div
                    className="yukseklik"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {" "}
                    <h2>YAPILIYOR</h2>
                    <QuoteList
                      quotes={inProgress}
                      deleteFunction={deleteQuote}
                      col="InProgress"
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
            <Col xs={12} md={4}>
              <Droppable droppableId="Done">
                {(provided) => (
                  <div
                    className="yukseklik"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {" "}
                    <h2>BİTTİ</h2>
                    <QuoteList
                      quotes={done}
                      deleteFunction={deleteQuote}
                      col="Done"
                    />
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </Col>
          </Row>
        </Container>
      </DragDropContext>
    </>
  );
}
