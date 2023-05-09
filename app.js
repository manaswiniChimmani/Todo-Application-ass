const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");
const isMatch = require("date-fns/isMatch");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "todoApplication.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000);
  } catch (e) {
    console.log(`DB Error:${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();
const convertDbObjectToResponseObject = (dbObject) => {
  return {
    //   movieName: dbObject.movie_name,
    id: dbObject.id,
    todo: dbObject.todo,
    priority: dbObject.priority,
    category: dbObject.category,
    status: dbObject.status,
    dueDate: dbObject.due_date,
  };
};
//API 1
const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};
const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodosQuery = "";
  const { search_q = "", priority, status, category } = request.query;
  // todo LIKE '%${search_q}%'
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
            SELECT
                *
            FROM
                todo  
            WHERE
               
                status = '${status}'
                AND priority = '${priority}';`;
          data = await db.all(getTodosQuery);

          response.send(
            data.map((each) => convertDbObjectToResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasPriorityProperty(request.query):
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    
                    priority = '${priority}';`;
        data = await db.all(getTodosQuery);

        response.send(
          data.map((each) => convertDbObjectToResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }

      break;
    case hasStatusProperty(request.query):
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        getTodosQuery = `
            SELECT
                *
            FROM
                todo 
            WHERE
                
                status = '${status}';`;
        data = await db.all(getTodosQuery);

        response.send(
          data.map((each) => convertDbObjectToResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }

      break;
    case hasCategoryAndStatusProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          status === "TO DO" ||
          status === "IN PROGRESS" ||
          status === "DONE"
        ) {
          getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    category='${category}'
                    AND status = '${status}';`;
          data = await db.all(getTodosQuery);

          response.send(
            data.map((each) => convertDbObjectToResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case hasCategoryProperty(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        getTodosQuery = `
                SELECT
                    *
                FROM
                    todo 
                WHERE
                    category='${category}';`;
        data = await db.all(getTodosQuery);

        response.send(
          data.map((each) => convertDbObjectToResponseObject(each))
        );
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;
    case hasCategoryAndPriorityProperties(request.query):
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (
          priority === "HIGH" ||
          priority === "MEDIUM" ||
          priority === "LOW"
        ) {
          getTodosQuery = `
                    SELECT
                        *
                    FROM
                        todo 
                    WHERE
                        category='${category}'
                        AND priority='${priority}';`;
          data = await db.all(getTodosQuery);

          response.send(
            data.map((each) => convertDbObjectToResponseObject(each))
          );
        } else {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }

      break;

    default:
      getTodosQuery = `
        SELECT
            *
        FROM
            todo 
        WHERE
            todo LIKE '%${search_q}%';`;
      data = await db.all(getTodosQuery);

      response.send(data.map((each) => convertDbObjectToResponseObject(each)));
  }

  //   data = await db.all(getTodosQuery);

  //   response.send(data.map((each) => convertDbObjectToResponseObject(each)));
});
//API 2
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
    *
    FROM
    todo WHERE id = ${todoId};`;
  const todo1 = await db.get(getTodoQuery);

  response.send(convertDbObjectToResponseObject(todo1));
});
//API 3
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  //   const newDate=format(new Date(date),"yyyy-MM-dd");
  const result = isValid(new Date(date));

  if (isMatch(date, "yyyy-MM-dd")) {
    const newDate = format(new Date(date), "yyyy-MM-dd");
    const getTodoQuery = `
        SELECT
        *
        FROM
        todo WHERE due_date = '${newDate}';`;
    const todo1 = await db.all(getTodoQuery);
    response.send(todo1.map((each) => convertDbObjectToResponseObject(each)));
    // response.send(todo1);
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});
//API 4
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status, category, dueDate } = todoDetails;
  if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
    if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        if (isMatch(dueDate, "yyyy-MM-dd")) {
          const newDate2 = format(new Date(dueDate), "yyyy-MM-dd");
          const addTodoQuery = `
                    INSERT INTO
                    todo (id,todo,category,priority,status,due_date)
                    VALUES
                    (
                        ${id},
                        '${todo}',
                        '${category}',
                        '${priority}',
                        
                        '${status}',
                        '${newDate2}'

                    );`;

          await db.run(addTodoQuery);
          response.send("Todo Successfully Added");
        } else {
          response.status(400);
          response.send("Invalid Due Date");
        }
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
    } else {
      response.status(400);
      response.send("Invalid Todo Status");
    }
  } else {
    response.status(400);
    response.send("Invalid Todo Priority");
  }
});

//API 5

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const requestBody = request.body;
  let updateColumn = "";
  const todoQuery = `SELECT * FROM todo WHERE id=${todoId};`;
  const getTodoQuery = await db.get(todoQuery);
  const {
    todo = getTodoQuery.todo,
    priority = getTodoQuery.priority,
    status = getTodoQuery.status,
    category = getTodoQuery.category,
    dueDate = getTodoQuery.dueDate,
  } = request.body;
  let updateTodo;
  switch (true) {
    case requestBody.status !== undefined:
      if (status === "TO DO" || status === "IN PROGRESS" || status === "DONE") {
        updateTodo = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',
               due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodo);
        response.send("Status Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;
    case requestBody.priority !== undefined:
      if (priority === "HIGH" || priority === "MEDIUM" || priority === "LOW") {
        updateTodo = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',
               due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodo);
        response.send("Priority Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;
    case requestBody.todo !== undefined:
      updateTodo = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',
               due_date='${dueDate}' WHERE id=${todoId};`;
      await db.run(updateTodo);
      response.send("Todo Updated");
      break;
    case requestBody.category !== undefined:
      if (
        category === "WORK" ||
        category === "HOME" ||
        category === "LEARNING"
      ) {
        updateTodo = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',
               due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodo);
        response.send("Category Updated");
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;
    case requestBody.dueDate !== undefined:
      if (isMatch(dueDate, "yyyy-MM-dd")) {
        const newDate1 = format(new Date(dueDate), "yyyy-MM-dd");
        updateTodo = `UPDATE todo SET todo='${todo}',priority='${priority}',status='${status}',category='${category}',
               due_date='${dueDate}' WHERE id=${todoId};`;
        await db.run(updateTodo);
        response.send("Due Date Updated");
      } else {
        response.status(400);
        response.send("Invalid Due Date");
      }
      break;
  }
});
//API 6
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodoQuery = `
    DELETE FROM
      todo
    WHERE
      id = ${todoId};`;
  await db.run(deleteTodoQuery);
  response.send("Todo Deleted");
});
module.exports = app;
