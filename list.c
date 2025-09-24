#include <stdio.h>
#include <stdlib.h>

typedef struct node
{
    int number;
    struct node *next;
} node;

int main(void)
{
    node *list = NULL;
    
    for (int i = 0; i < 3; i++)
    {
        node *n = malloc(sizeof(node));
        if (n == NULL)
        {
            return 1;
        }

        n->number = i + 1;
        n->next = list;
        list = n;
    }
    
    node *n = list;

    while (n != NULL)
    {
        printf("%i\n", n->number);
        n = n->next;
    }

    n = list;
    n = NULL;
    while(n != NULL)
    {


    }


    node *tmp = NULL;
    while (list != NULL)
    {
        tmp = list->next;
        free(list);
        list = tmp;
    }
}